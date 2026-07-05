import type {
  ClinicalEvent,
  ClinicalEventType,
  CreateClinicalEventFactoryInput,
} from "./types";

function createId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function createTypedEvent(
  type: ClinicalEventType,
  input: CreateClinicalEventFactoryInput
): ClinicalEvent {
  return {
    id: createId(),
    patientId: input.patientId,
    timestamp: Date.now(),
    type,
    payload: input.payload,
  };
}

export function createObservationEvent(
  input: CreateClinicalEventFactoryInput
): ClinicalEvent {
  return createTypedEvent("observation", input);
}

export function createDiagnosisEvent(
  input: CreateClinicalEventFactoryInput
): ClinicalEvent {
  return createTypedEvent("diagnosis", input);
}

export function createMedicationEvent(
  input: CreateClinicalEventFactoryInput
): ClinicalEvent {
  return createTypedEvent("medication", input);
}

export function createProcedureEvent(
  input: CreateClinicalEventFactoryInput
): ClinicalEvent {
  return createTypedEvent("procedure", input);
}

export function createEncounterEvent(
  input: CreateClinicalEventFactoryInput
): ClinicalEvent {
  return createTypedEvent("encounter", input);
}

export function createLabResultEvent(
  input: CreateClinicalEventFactoryInput
): ClinicalEvent {
  return createTypedEvent("lab_result", input);
}
