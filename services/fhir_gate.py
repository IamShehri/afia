"""
AFIA FHIR Gate v1 — transform OpenMed NER entities into a FHIR R4B Bundle.

Uses fhir.resources.R4B (R4-compatible) so every resource is pydantic-validated
before serialization. No PHI is emitted: PII-type labels are skipped entirely.
"""

from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any, Optional

from fhir.resources.R4B.attachment import Attachment
from fhir.resources.R4B.bundle import Bundle, BundleEntry
from fhir.resources.R4B.codeableconcept import CodeableConcept
from fhir.resources.R4B.condition import Condition
from fhir.resources.R4B.documentreference import (
    DocumentReference,
    DocumentReferenceContent,
)
from fhir.resources.R4B.extension import Extension
from fhir.resources.R4B.medicationstatement import MedicationStatement
from fhir.resources.R4B.observation import Observation
from fhir.resources.R4B.patient import Patient
from fhir.resources.R4B.reference import Reference

CONFIDENCE_EXTENSION_URL = "https://afia.health/fhir/confidence"
ANALYZED_WITH_EXTENSION_URL = "https://afia.health/fhir/analyzed-with"
PAGE_COUNT_EXTENSION_URL = "https://afia.health/fhir/page-count"

PATIENT_ID = "anonymous-patient"
PATIENT_REF = Reference(reference=f"Patient/{PATIENT_ID}")

CLINICAL_STATUS_ACTIVE = CodeableConcept(
    coding=[
        {
            "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
            "code": "active",
        }
    ]
)

# ---------------------------------------------------------------------------
# Label → resource mapping (clinical heart of FHIR Gate)
#
# Matching: entity["label"] is normalized (strip, upper-case, punctuation → _)
# then checked against each set below in priority order:
#   1. PII_BLOCKLIST  → skip (never emitted; increments entities_skipped_pii)
#   2. CONDITION_LABELS → Condition (diagnoses/problems only)
#   3. MEDICATION_LABELS → MedicationStatement (drugs/doses only)
#   4. OBSERVATION_LABELS + all other labels → Observation fallback
#      (symptoms, findings, allied-health therapies, unmapped tags)
#      Before emitting Observation, entity text is scanned for PII regexes.
#
# OpenMed models vary by specialty; sets include common synonyms/variants.
# ---------------------------------------------------------------------------

OBSERVATION_LABELS: frozenset[str] = frozenset(
    {
        # Symptoms / findings — not diagnosed Conditions in FHIR
        "SIGN_SYMPTOM",
        "SYMPTOM",
        "FINDING",
        # Allied-health therapies — not MedicationStatements
        "TREATMENT",
        "THERAPY",
    }
)

PII_BLOCKLIST: frozenset[str] = frozenset(
    {
        # Person / identity — entity text NEVER emitted
        "PERSON",
        "NAME",
        "PATIENT",
        "PATIENT_NAME",
        "GIVEN_NAME",
        "FAMILY_NAME",
        "FULL_NAME",
        "PROVIDER",
        "DOCTOR",
        "PHYSICIAN",
        "CLINICIAN",
        # Identifiers
        "ID",
        "IDENTIFIER",
        "MRN",
        "MEDICAL_RECORD_NUMBER",
        "SSN",
        "SOCIAL_SECURITY",
        "NATIONAL_ID",
        "ACCOUNT",
        "ACCOUNT_NUMBER",
        "NPI",
        "LICENSE",
        "CREDENTIAL",
        "MEMBER_ID",
        "POLICY_NUMBER",
        # Contact / location PII
        "PHONE",
        "TELEPHONE",
        "FAX",
        "EMAIL",
        "E_MAIL",
        "E-MAIL",
        "URL",
        "IP",
        "IP_ADDRESS",
        "ADDRESS",
        "STREET",
        "CITY",
        "ZIP",
        "POSTAL",
        "POSTAL_CODE",
        # Dates tied to identity (not clinical events)
        "DATE",
        "DOB",
        "DATE_OF_BIRTH",
        "BIRTH_DATE",
        "BIRTHDATE",
        "AGE",  # often derived from DOB in notes
    }
)

CONDITION_LABELS: frozenset[str] = frozenset(
    {
        "DISEASE",
        "CONDITION",
        "DISORDER",
        "DIAGNOSIS",
        "DX",
        "PROBLEM",
        "SYNDROME",
        "PATHOLOGY",
        "COMORBIDITY",
        "COMPLAINT",
        "ICD",
        "ICD10",
        "SNOMED",
    }
)

MEDICATION_LABELS: frozenset[str] = frozenset(
    {
        "MEDICATION",
        "MEDICINE",
        "DRUG",
        "CHEMICAL",
        "PHARMA",
        "PHARMACEUTICAL",
        "RX",
        "PRESCRIPTION",
        "DOSE",
        "DOSAGE",
        "VACCINE",
        "BIOLOGIC",
        "SUPPLEMENT",
        "HERB",
        "NUTRACEUTICAL",
    }
)

# Defensive PII scan on Observation fallback text (mislabeled names, etc.)
PII_TEXT_PATTERNS: tuple[re.Pattern[str], ...] = (
    re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),  # SSN dashed
    re.compile(r"\b(?:MRN|mrn|Acct|Account)\s*#?\s*\d{4,12}\b"),
    re.compile(
        r"\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"
    ),  # phone
    re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"),  # email
    re.compile(r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b"),  # MM/DD/YYYY etc.
    re.compile(r"\b\d{4}-\d{2}-\d{2}\b"),  # ISO date
)


class FhirGateError(Exception):
    """Raised when bundle construction fails after entity classification."""


def _normalize_label(label: str) -> str:
    return (
        label.strip()
        .upper()
        .replace("-", "_")
        .replace(" ", "_")
        .replace("/", "_")
    )


def classify_entity_label(label: str) -> str:
    """
    Classify a normalized entity label.

    Returns one of: ``pii``, ``condition``, ``medication``, ``observation``.
    """
    normalized = _normalize_label(label)
    if not normalized:
        return "observation"
    if normalized in PII_BLOCKLIST:
        return "pii"
    if normalized in CONDITION_LABELS:
        return "condition"
    if normalized in MEDICATION_LABELS:
        return "medication"
    if normalized in OBSERVATION_LABELS:
        return "observation"
    return "observation"


def _text_matches_pii_patterns(text: str) -> bool:
    """Second-layer PII guard for Observation fallback (regex on entity text)."""
    for pattern in PII_TEXT_PATTERNS:
        if pattern.search(text):
            return True
    return False


def _confidence_extension(confidence: float) -> Extension:
    return Extension(url=CONFIDENCE_EXTENSION_URL, valueDecimal=round(confidence, 4))


def _build_patient() -> Patient:
    return Patient(id=PATIENT_ID)


def _build_document_reference(doc_meta: dict[str, Any]) -> DocumentReference:
    title = str(doc_meta.get("title") or "Clinical document").strip() or "Clinical document"
    analyzed_with = doc_meta.get("analyzed_with")
    page_count = doc_meta.get("page_count")

    extensions: list[Extension] = []
    if analyzed_with:
        extensions.append(
            Extension(url=ANALYZED_WITH_EXTENSION_URL, valueString=str(analyzed_with))
        )
    if page_count is not None:
        extensions.append(
            Extension(url=PAGE_COUNT_EXTENSION_URL, valueInteger=int(page_count))
        )

    analyzed_at = doc_meta.get("analyzed_at")
    if analyzed_at:
        date_value = str(analyzed_at)
    else:
        date_value = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    return DocumentReference(
        id="source-document",
        status="current",
        description=title,
        subject=PATIENT_REF,
        date=date_value,
        extension=extensions or None,
        # Metadata only — attachment has contentType but no embedded document bytes/text.
        content=[
            DocumentReferenceContent(
                attachment=Attachment(contentType="application/pdf"),
            )
        ],
    )


def _build_condition(entity: dict[str, Any], resource_id: str) -> Condition:
    text = str(entity.get("text") or "").strip()
    confidence = float(entity.get("confidence") or 0.0)
    return Condition(
        id=resource_id,
        clinicalStatus=CLINICAL_STATUS_ACTIVE,
        subject=PATIENT_REF,
        code=CodeableConcept(text=text),
        extension=[_confidence_extension(confidence)],
    )


def _build_medication_statement(entity: dict[str, Any], resource_id: str) -> MedicationStatement:
    text = str(entity.get("text") or "").strip()
    return MedicationStatement(
        id=resource_id,
        status="unknown",
        subject=PATIENT_REF,
        medicationCodeableConcept=CodeableConcept(text=text),
    )


def _build_observation(entity: dict[str, Any], label: str, resource_id: str) -> Observation:
    text = str(entity.get("text") or "").strip()
    normalized_label = _normalize_label(label) or "UNMAPPED"
    return Observation(
        id=resource_id,
        status="final",
        subject=PATIENT_REF,
        code=CodeableConcept(text=normalized_label),
        valueString=text,
    )


def entities_to_fhir(
    entities: list[dict[str, Any]],
    doc_meta: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """
    Transform analyzed entities into a FHIR R4B collection Bundle.

    Returns ``{ "bundle": {...}, "summary": {...} }``.
    """
    doc_meta = doc_meta or {}
    resources_created: dict[str, int] = {}
    entities_skipped_pii = 0
    entities_unmapped = 0
    entities_skipped_empty = 0

    entries: list[BundleEntry] = [
        BundleEntry(resource=_build_patient()),
        BundleEntry(resource=_build_document_reference(doc_meta)),
    ]

    condition_idx = 0
    medication_idx = 0
    observation_idx = 0

    for entity in entities:
        label = str(entity.get("label") or "")
        text = str(entity.get("text") or "").strip()
        if not text:
            entities_skipped_empty += 1
            continue

        kind = classify_entity_label(label)

        if kind == "pii":
            entities_skipped_pii += 1
            continue

        if kind == "condition":
            condition_idx += 1
            resource = _build_condition(entity, f"condition-{condition_idx}")
            resource_type = "Condition"
        elif kind == "medication":
            medication_idx += 1
            resource = _build_medication_statement(entity, f"medication-{medication_idx}")
            resource_type = "MedicationStatement"
        else:
            if _text_matches_pii_patterns(text):
                entities_skipped_pii += 1
                continue
            observation_idx += 1
            entities_unmapped += 1
            resource = _build_observation(entity, label, f"observation-{observation_idx}")
            resource_type = "Observation"

        resources_created[resource_type] = resources_created.get(resource_type, 0) + 1
        entries.append(BundleEntry(resource=resource))

    try:
        bundle = Bundle(
            type="collection",
            timestamp=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            entry=entries,
        )
        bundle_dict = bundle.model_dump(mode="json", exclude_none=True)
    except Exception as exc:
        raise FhirGateError(f"FHIR Bundle construction failed: {exc}") from exc

    return {
        "bundle": bundle_dict,
        "summary": {
            "resources_created": resources_created,
            "entities_skipped_pii": entities_skipped_pii,
            "entities_unmapped": entities_unmapped,
            "entities_skipped_empty": entities_skipped_empty,
        },
    }
