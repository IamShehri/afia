import type { Patient } from "./types";

// Deterministic, synthetic demo data. No real patient information (PHI).
export const patients: Patient[] = [
  {
    "id": "MRN-04261",
    "name": "Kai Park",
    "age": 56,
    "sex": "F",
    "status": "discharged",
    "risk": "critical",
    "riskScore": 95,
    "condition": "Anemia",
    "careTeam": "c6",
    "room": undefined,
    "location": "Clinic — West",
    "lastSeen": "2026-06-22T17:30:00Z",
    "nextAppt": "2026-07-08T09:30:00Z",
    "insurer": "UnitedHealth",
    "flags": [
      {
        "id": "MRN-04261-f0",
        "kind": "medication",
        "severity": "critical",
        "message": "Warfarin + new NSAID — interaction",
        "at": "2026-06-30T02:30:00Z"
      },
      {
        "id": "MRN-04261-f1",
        "kind": "ai",
        "severity": "moderate",
        "message": "Pattern matches early sepsis criteria",
        "at": "2026-06-29T18:30:00Z"
      },
      {
        "id": "MRN-04261-f2",
        "kind": "medication",
        "severity": "critical",
        "message": "Warfarin + new NSAID — interaction",
        "at": "2026-07-01T00:30:00Z"
      },
      {
        "id": "MRN-04261-f3",
        "kind": "admin",
        "severity": "moderate",
        "message": "Missing discharge summary",
        "at": "2026-06-29T13:30:00Z"
      }
    ],
    "vitals": [
      {
        "label": "HR",
        "value": "121",
        "unit": "bpm",
        "trend": "down",
        "state": "alert"
      },
      {
        "label": "BP",
        "value": "161/105",
        "unit": "mmHg",
        "trend": "flat",
        "state": "alert"
      },
      {
        "label": "SpO₂",
        "value": "89",
        "unit": "%",
        "trend": "down",
        "state": "alert"
      },
      {
        "label": "Temp",
        "value": "38.4",
        "unit": "°C",
        "trend": "up",
        "state": "watch"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04261-t2",
        "at": "2026-06-28T03:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Stable, continue plan",
        "author": "AFIA"
      },
      {
        "id": "MRN-04261-t0",
        "at": "2026-06-26T23:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Stable, continue plan",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04261-t1",
        "at": "2026-06-23T23:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Flagged for review",
        "author": "Dr. E. Vance"
      },
      {
        "id": "MRN-04261-t3",
        "at": "2026-06-07T07:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Flagged for review",
        "author": "AFIA"
      },
      {
        "id": "MRN-04261-t4",
        "at": "2026-06-07T06:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Flagged for review",
        "author": "S. Whitfield, NP"
      }
    ],
    "allergies": [
      "Latex",
      "Peanuts"
    ],
    "medications": [
      {
        "name": "Insulin glargine",
        "dose": "18 U",
        "freq": "Nightly"
      }
    ],
    "aiSummary": "56F, anemia. Recent vitals within acceptable range."
  },
  {
    "id": "MRN-04233",
    "name": "Arlo Romano",
    "age": 66,
    "sex": "M",
    "status": "active",
    "risk": "critical",
    "riskScore": 91,
    "condition": "Pre-diabetes",
    "careTeam": "c5",
    "room": undefined,
    "location": "Ward 2A",
    "lastSeen": "2026-06-21T21:30:00Z",
    "nextAppt": "2026-07-10T22:30:00Z",
    "insurer": "Aetna",
    "flags": [
      {
        "id": "MRN-04233-f0",
        "kind": "medication",
        "severity": "high",
        "message": "Warfarin + new NSAID — interaction",
        "at": "2026-06-29T07:30:00Z"
      },
      {
        "id": "MRN-04233-f1",
        "kind": "medication",
        "severity": "critical",
        "message": "Warfarin + new NSAID — interaction",
        "at": "2026-06-28T23:30:00Z"
      },
      {
        "id": "MRN-04233-f2",
        "kind": "vitals",
        "severity": "moderate",
        "message": "SpO₂ trending down over 3 readings",
        "at": "2026-06-29T15:30:00Z"
      },
      {
        "id": "MRN-04233-f3",
        "kind": "lab",
        "severity": "moderate",
        "message": "Potassium 5.6 mmol/L — recheck advised",
        "at": "2026-06-28T11:30:00Z"
      }
    ],
    "vitals": [
      {
        "label": "HR",
        "value": "119",
        "unit": "bpm",
        "trend": "up",
        "state": "alert"
      },
      {
        "label": "BP",
        "value": "168/106",
        "unit": "mmHg",
        "trend": "flat",
        "state": "alert"
      },
      {
        "label": "SpO₂",
        "value": "90",
        "unit": "%",
        "trend": "down",
        "state": "alert"
      },
      {
        "label": "Temp",
        "value": "38.7",
        "unit": "°C",
        "trend": "up",
        "state": "alert"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04233-t3",
        "at": "2026-06-26T16:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Routine follow-up",
        "author": "Dr. E. Vance"
      },
      {
        "id": "MRN-04233-t2",
        "at": "2026-06-25T19:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Flagged for review",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04233-t0",
        "at": "2026-06-22T03:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Stable, continue plan",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04233-t4",
        "at": "2026-06-16T02:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Stable, continue plan",
        "author": "Dr. P. Nadar"
      },
      {
        "id": "MRN-04233-t1",
        "at": "2026-06-05T22:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Routine follow-up",
        "author": "S. Whitfield, NP"
      }
    ],
    "allergies": [
      "Penicillin",
      "Sulfa"
    ],
    "medications": [
      {
        "name": "Metformin",
        "dose": "500 mg",
        "freq": "BID"
      },
      {
        "name": "Apixaban",
        "dose": "5 mg",
        "freq": "BID"
      },
      {
        "name": "Furosemide",
        "dose": "20 mg",
        "freq": "Daily"
      }
    ],
    "aiSummary": "66M, pre-diabetes. Recent vitals within acceptable range."
  },
  {
    "id": "MRN-04219",
    "name": "Naomi Haddad",
    "age": 37,
    "sex": "M",
    "status": "discharged",
    "risk": "critical",
    "riskScore": 90,
    "condition": "COPD",
    "careTeam": "c6",
    "room": undefined,
    "location": "Ward 4B",
    "lastSeen": "2026-06-21T12:30:00Z",
    "nextAppt": undefined,
    "insurer": "UnitedHealth",
    "flags": [
      {
        "id": "MRN-04219-f0",
        "kind": "ai",
        "severity": "moderate",
        "message": "AFIA predicts 18% readmission risk",
        "at": "2026-06-29T01:30:00Z"
      },
      {
        "id": "MRN-04219-f1",
        "kind": "medication",
        "severity": "high",
        "message": "Renal dosing review needed",
        "at": "2026-06-29T03:30:00Z"
      }
    ],
    "vitals": [
      {
        "label": "HR",
        "value": "124",
        "unit": "bpm",
        "trend": "up",
        "state": "alert"
      },
      {
        "label": "BP",
        "value": "156/99",
        "unit": "mmHg",
        "trend": "flat",
        "state": "watch"
      },
      {
        "label": "SpO₂",
        "value": "90",
        "unit": "%",
        "trend": "flat",
        "state": "alert"
      },
      {
        "label": "Temp",
        "value": "38.8",
        "unit": "°C",
        "trend": "flat",
        "state": "alert"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04219-t4",
        "at": "2026-07-01T00:30:00Z",
        "type": "note",
        "title": "Progress note",
        "detail": "Flagged for review",
        "author": "Dr. N. Okafor"
      },
      {
        "id": "MRN-04219-t1",
        "at": "2026-06-26T19:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Stable, continue plan",
        "author": "AFIA"
      },
      {
        "id": "MRN-04219-t3",
        "at": "2026-06-18T18:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Routine follow-up",
        "author": "AFIA"
      },
      {
        "id": "MRN-04219-t0",
        "at": "2026-06-18T11:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Stable, continue plan",
        "author": "AFIA"
      },
      {
        "id": "MRN-04219-t2",
        "at": "2026-06-16T01:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Flagged for review",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04219-t5",
        "at": "2026-06-10T04:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Adjusted per protocol",
        "author": "Dr. E. Vance"
      }
    ],
    "allergies": [
      "Peanuts",
      "NKDA"
    ],
    "medications": [
      {
        "name": "Albuterol",
        "dose": "90 mcg",
        "freq": "PRN"
      },
      {
        "name": "Apixaban",
        "dose": "5 mg",
        "freq": "BID"
      }
    ],
    "aiSummary": "37M, copd. Trending stable; monitor labs at next visit."
  },
  {
    "id": "MRN-04142",
    "name": "Eli Strand",
    "age": 58,
    "sex": "M",
    "status": "active",
    "risk": "critical",
    "riskScore": 87,
    "condition": "CHF",
    "careTeam": "c2",
    "room": undefined,
    "location": "Clinic — West",
    "lastSeen": "2026-06-30T12:30:00Z",
    "nextAppt": "2026-07-09T02:30:00Z",
    "insurer": "Meridian Health",
    "flags": [
      {
        "id": "MRN-04142-f0",
        "kind": "vitals",
        "severity": "critical",
        "message": "BP above target range",
        "at": "2026-06-29T05:30:00Z"
      },
      {
        "id": "MRN-04142-f1",
        "kind": "admin",
        "severity": "moderate",
        "message": "Insurance auth expiring in 2 days",
        "at": "2026-06-30T11:30:00Z"
      },
      {
        "id": "MRN-04142-f2",
        "kind": "ai",
        "severity": "critical",
        "message": "Care-gap: overdue A1c",
        "at": "2026-06-29T15:30:00Z"
      },
      {
        "id": "MRN-04142-f3",
        "kind": "ai",
        "severity": "moderate",
        "message": "Pattern matches early sepsis criteria",
        "at": "2026-06-30T13:30:00Z"
      }
    ],
    "vitals": [
      {
        "label": "HR",
        "value": "113",
        "unit": "bpm",
        "trend": "down",
        "state": "alert"
      },
      {
        "label": "BP",
        "value": "162/103",
        "unit": "mmHg",
        "trend": "flat",
        "state": "alert"
      },
      {
        "label": "SpO₂",
        "value": "91",
        "unit": "%",
        "trend": "down",
        "state": "alert"
      },
      {
        "label": "Temp",
        "value": "38.8",
        "unit": "°C",
        "trend": "flat",
        "state": "alert"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04142-t0",
        "at": "2026-06-29T17:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Reviewed by care team",
        "author": "Dr. E. Vance"
      },
      {
        "id": "MRN-04142-t2",
        "at": "2026-06-21T20:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Routine follow-up",
        "author": "Dr. E. Vance"
      },
      {
        "id": "MRN-04142-t3",
        "at": "2026-06-17T08:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Adjusted per protocol",
        "author": "Dr. N. Okafor"
      },
      {
        "id": "MRN-04142-t1",
        "at": "2026-06-11T17:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Adjusted per protocol",
        "author": "S. Whitfield, NP"
      }
    ],
    "allergies": [
      "NKDA",
      "Codeine"
    ],
    "medications": [
      {
        "name": "Amlodipine",
        "dose": "5 mg",
        "freq": "Daily"
      },
      {
        "name": "Furosemide",
        "dose": "20 mg",
        "freq": "Daily"
      },
      {
        "name": "Metformin",
        "dose": "500 mg",
        "freq": "BID"
      },
      {
        "name": "Levothyroxine",
        "dose": "75 mcg",
        "freq": "Daily"
      }
    ],
    "aiSummary": "58M, chf. Glycemic control improving on current regimen."
  },
  {
    "id": "MRN-04198",
    "name": "Lucas Volkov",
    "age": 57,
    "sex": "F",
    "status": "discharged",
    "risk": "critical",
    "riskScore": 86,
    "condition": "Hypothyroidism",
    "careTeam": "c2",
    "room": undefined,
    "location": "Clinic — West",
    "lastSeen": "2026-06-25T13:30:00Z",
    "nextAppt": undefined,
    "insurer": "BlueCross",
    "flags": [
      {
        "id": "MRN-04198-f0",
        "kind": "vitals",
        "severity": "high",
        "message": "BP above target range",
        "at": "2026-06-30T01:30:00Z"
      },
      {
        "id": "MRN-04198-f1",
        "kind": "vitals",
        "severity": "critical",
        "message": "BP above target range",
        "at": "2026-07-01T07:30:00Z"
      },
      {
        "id": "MRN-04198-f2",
        "kind": "medication",
        "severity": "moderate",
        "message": "Dose overdue by 2h",
        "at": "2026-06-28T15:30:00Z"
      },
      {
        "id": "MRN-04198-f3",
        "kind": "ai",
        "severity": "moderate",
        "message": "Care-gap: overdue A1c",
        "at": "2026-06-29T02:30:00Z"
      }
    ],
    "vitals": [
      {
        "label": "HR",
        "value": "126",
        "unit": "bpm",
        "trend": "flat",
        "state": "alert"
      },
      {
        "label": "BP",
        "value": "163/105",
        "unit": "mmHg",
        "trend": "up",
        "state": "alert"
      },
      {
        "label": "SpO₂",
        "value": "90",
        "unit": "%",
        "trend": "down",
        "state": "alert"
      },
      {
        "label": "Temp",
        "value": "38.5",
        "unit": "°C",
        "trend": "flat",
        "state": "alert"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04198-t4",
        "at": "2026-06-27T14:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Adjusted per protocol",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04198-t5",
        "at": "2026-06-26T10:30:00Z",
        "type": "note",
        "title": "Progress note",
        "detail": "Reviewed by care team",
        "author": "Dr. P. Nadar"
      },
      {
        "id": "MRN-04198-t1",
        "at": "2026-06-17T16:30:00Z",
        "type": "note",
        "title": "Progress note",
        "detail": "Routine follow-up",
        "author": "Dr. E. Vance"
      },
      {
        "id": "MRN-04198-t3",
        "at": "2026-06-14T06:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Flagged for review",
        "author": "Dr. N. Okafor"
      },
      {
        "id": "MRN-04198-t2",
        "at": "2026-06-13T19:30:00Z",
        "type": "note",
        "title": "Progress note",
        "detail": "Reviewed by care team",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04198-t0",
        "at": "2026-06-11T07:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Adjusted per protocol",
        "author": "AFIA"
      },
      {
        "id": "MRN-04198-t6",
        "at": "2026-06-03T07:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Flagged for review",
        "author": "AFIA"
      }
    ],
    "allergies": [
      "Penicillin",
      "Sulfa",
      "Iodine contrast"
    ],
    "medications": [
      {
        "name": "Insulin glargine",
        "dose": "18 U",
        "freq": "Nightly"
      },
      {
        "name": "Amlodipine",
        "dose": "5 mg",
        "freq": "Daily"
      },
      {
        "name": "Levothyroxine",
        "dose": "75 mcg",
        "freq": "Daily"
      }
    ],
    "aiSummary": "57F, hypothyroidism. Trending stable; monitor labs at next visit."
  },
  {
    "id": "MRN-04240",
    "name": "Esme Voss",
    "age": 80,
    "sex": "F",
    "status": "active",
    "risk": "critical",
    "riskScore": 83,
    "condition": "Hypothyroidism",
    "careTeam": "c1",
    "room": undefined,
    "location": "Ward 2A",
    "lastSeen": "2026-06-22T06:30:00Z",
    "nextAppt": "2026-07-03T18:30:00Z",
    "insurer": "Self-pay",
    "flags": [
      {
        "id": "MRN-04240-f0",
        "kind": "vitals",
        "severity": "critical",
        "message": "SpO₂ trending down over 3 readings",
        "at": "2026-07-01T01:30:00Z"
      },
      {
        "id": "MRN-04240-f1",
        "kind": "lab",
        "severity": "critical",
        "message": "Creatinine rising vs baseline",
        "at": "2026-06-28T11:30:00Z"
      }
    ],
    "vitals": [
      {
        "label": "HR",
        "value": "113",
        "unit": "bpm",
        "trend": "flat",
        "state": "alert"
      },
      {
        "label": "BP",
        "value": "167/106",
        "unit": "mmHg",
        "trend": "up",
        "state": "alert"
      },
      {
        "label": "SpO₂",
        "value": "91",
        "unit": "%",
        "trend": "flat",
        "state": "alert"
      },
      {
        "label": "Temp",
        "value": "38.8",
        "unit": "°C",
        "trend": "up",
        "state": "alert"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04240-t3",
        "at": "2026-06-22T04:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Reviewed by care team",
        "author": "AFIA"
      },
      {
        "id": "MRN-04240-t4",
        "at": "2026-06-13T17:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Adjusted per protocol",
        "author": "AFIA"
      },
      {
        "id": "MRN-04240-t5",
        "at": "2026-06-13T15:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Routine follow-up",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04240-t1",
        "at": "2026-06-09T19:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Flagged for review",
        "author": "AFIA"
      },
      {
        "id": "MRN-04240-t0",
        "at": "2026-06-05T21:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Flagged for review",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04240-t2",
        "at": "2026-06-01T10:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Routine follow-up",
        "author": "Dr. P. Nadar"
      }
    ],
    "allergies": [
      "NKDA",
      "Codeine",
      "Latex"
    ],
    "medications": [
      {
        "name": "Apixaban",
        "dose": "5 mg",
        "freq": "BID"
      },
      {
        "name": "Insulin glargine",
        "dose": "18 U",
        "freq": "Nightly"
      },
      {
        "name": "Metformin",
        "dose": "500 mg",
        "freq": "BID"
      }
    ],
    "aiSummary": "80F, hypothyroidism. Trending stable; monitor labs at next visit."
  },
  {
    "id": "MRN-04226",
    "name": "Omar Lindqvist",
    "age": 53,
    "sex": "M",
    "status": "follow-up",
    "risk": "high",
    "riskScore": 82,
    "condition": "CHF",
    "careTeam": "c4",
    "room": undefined,
    "location": "Ward 2A",
    "lastSeen": "2026-06-25T21:30:00Z",
    "nextAppt": "2026-07-11T17:30:00Z",
    "insurer": "Aetna",
    "flags": [
      {
        "id": "MRN-04226-f0",
        "kind": "ai",
        "severity": "moderate",
        "message": "AFIA predicts 18% readmission risk",
        "at": "2026-06-29T07:30:00Z"
      },
      {
        "id": "MRN-04226-f1",
        "kind": "admin",
        "severity": "high",
        "message": "Missing discharge summary",
        "at": "2026-07-01T08:30:00Z"
      }
    ],
    "vitals": [
      {
        "label": "HR",
        "value": "95",
        "unit": "bpm",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "BP",
        "value": "144/92",
        "unit": "mmHg",
        "trend": "flat",
        "state": "watch"
      },
      {
        "label": "SpO₂",
        "value": "95",
        "unit": "%",
        "trend": "down",
        "state": "normal"
      },
      {
        "label": "Temp",
        "value": "37.8",
        "unit": "°C",
        "trend": "flat",
        "state": "watch"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04226-t0",
        "at": "2026-06-26T02:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Reviewed by care team",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04226-t3",
        "at": "2026-06-21T09:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Reviewed by care team",
        "author": "Dr. N. Okafor"
      },
      {
        "id": "MRN-04226-t4",
        "at": "2026-06-07T10:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Adjusted per protocol",
        "author": "Dr. P. Nadar"
      },
      {
        "id": "MRN-04226-t2",
        "at": "2026-06-04T03:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Adjusted per protocol",
        "author": "Dr. N. Okafor"
      },
      {
        "id": "MRN-04226-t5",
        "at": "2026-06-03T17:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Routine follow-up",
        "author": "AFIA"
      },
      {
        "id": "MRN-04226-t1",
        "at": "2026-06-02T16:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Adjusted per protocol",
        "author": "Dr. P. Nadar"
      }
    ],
    "allergies": [
      "Aspirin",
      "Penicillin"
    ],
    "medications": [
      {
        "name": "Metformin",
        "dose": "500 mg",
        "freq": "BID"
      },
      {
        "name": "Amlodipine",
        "dose": "5 mg",
        "freq": "Daily"
      }
    ],
    "aiSummary": "53M, chf. Glycemic control improving on current regimen."
  },
  {
    "id": "MRN-04184",
    "name": "Juno Kapoor",
    "age": 86,
    "sex": "M",
    "status": "follow-up",
    "risk": "high",
    "riskScore": 81,
    "condition": "Hypothyroidism",
    "careTeam": "c2",
    "room": undefined,
    "location": "Ward 4B",
    "lastSeen": "2026-06-22T07:30:00Z",
    "nextAppt": "2026-07-13T04:30:00Z",
    "insurer": "UnitedHealth",
    "flags": [
      {
        "id": "MRN-04184-f0",
        "kind": "medication",
        "severity": "high",
        "message": "Warfarin + new NSAID — interaction",
        "at": "2026-06-30T18:30:00Z"
      },
      {
        "id": "MRN-04184-f1",
        "kind": "lab",
        "severity": "high",
        "message": "Creatinine rising vs baseline",
        "at": "2026-06-28T13:30:00Z"
      },
      {
        "id": "MRN-04184-f2",
        "kind": "lab",
        "severity": "high",
        "message": "Creatinine rising vs baseline",
        "at": "2026-06-28T20:30:00Z"
      }
    ],
    "vitals": [
      {
        "label": "HR",
        "value": "105",
        "unit": "bpm",
        "trend": "up",
        "state": "watch"
      },
      {
        "label": "BP",
        "value": "143/87",
        "unit": "mmHg",
        "trend": "up",
        "state": "watch"
      },
      {
        "label": "SpO₂",
        "value": "94",
        "unit": "%",
        "trend": "down",
        "state": "watch"
      },
      {
        "label": "Temp",
        "value": "37.8",
        "unit": "°C",
        "trend": "up",
        "state": "watch"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04184-t4",
        "at": "2026-06-29T01:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Flagged for review",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04184-t1",
        "at": "2026-06-27T02:30:00Z",
        "type": "note",
        "title": "Progress note",
        "detail": "Stable, continue plan",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04184-t5",
        "at": "2026-06-25T23:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Reviewed by care team",
        "author": "Dr. N. Okafor"
      },
      {
        "id": "MRN-04184-t2",
        "at": "2026-06-15T23:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Stable, continue plan",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04184-t3",
        "at": "2026-06-08T14:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Stable, continue plan",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04184-t0",
        "at": "2026-06-06T05:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Flagged for review",
        "author": "Dr. P. Nadar"
      }
    ],
    "allergies": [
      "NKDA"
    ],
    "medications": [
      {
        "name": "Insulin glargine",
        "dose": "18 U",
        "freq": "Nightly"
      },
      {
        "name": "Amlodipine",
        "dose": "5 mg",
        "freq": "Daily"
      },
      {
        "name": "Atorvastatin",
        "dose": "40 mg",
        "freq": "Nightly"
      }
    ],
    "aiSummary": "86M, hypothyroidism. Glycemic control improving on current regimen."
  },
  {
    "id": "MRN-04135",
    "name": "Clara Marlowe",
    "age": 28,
    "sex": "F",
    "status": "observation",
    "risk": "high",
    "riskScore": 80,
    "condition": "CHF",
    "careTeam": "c6",
    "room": "ICU-3",
    "location": "ICU",
    "lastSeen": "2026-06-21T14:30:00Z",
    "nextAppt": "2026-07-13T11:30:00Z",
    "insurer": "Medicare",
    "flags": [
      {
        "id": "MRN-04135-f0",
        "kind": "admin",
        "severity": "high",
        "message": "Missing discharge summary",
        "at": "2026-07-01T01:30:00Z"
      },
      {
        "id": "MRN-04135-f1",
        "kind": "lab",
        "severity": "high",
        "message": "Potassium 5.6 mmol/L — recheck advised",
        "at": "2026-06-29T01:30:00Z"
      },
      {
        "id": "MRN-04135-f2",
        "kind": "admin",
        "severity": "moderate",
        "message": "Consent form unsigned",
        "at": "2026-06-28T11:30:00Z"
      }
    ],
    "vitals": [
      {
        "label": "HR",
        "value": "100",
        "unit": "bpm",
        "trend": "up",
        "state": "watch"
      },
      {
        "label": "BP",
        "value": "148/97",
        "unit": "mmHg",
        "trend": "up",
        "state": "watch"
      },
      {
        "label": "SpO₂",
        "value": "95",
        "unit": "%",
        "trend": "down",
        "state": "normal"
      },
      {
        "label": "Temp",
        "value": "37.6",
        "unit": "°C",
        "trend": "flat",
        "state": "watch"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04135-t0",
        "at": "2026-06-26T22:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Stable, continue plan",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04135-t1",
        "at": "2026-06-26T19:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Flagged for review",
        "author": "Dr. E. Vance"
      },
      {
        "id": "MRN-04135-t2",
        "at": "2026-06-19T08:30:00Z",
        "type": "note",
        "title": "Progress note",
        "detail": "Flagged for review",
        "author": "Dr. E. Vance"
      },
      {
        "id": "MRN-04135-t3",
        "at": "2026-06-16T17:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Stable, continue plan",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04135-t4",
        "at": "2026-06-10T12:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Adjusted per protocol",
        "author": "Dr. N. Okafor"
      },
      {
        "id": "MRN-04135-t5",
        "at": "2026-06-04T07:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Reviewed by care team",
        "author": "S. Whitfield, NP"
      }
    ],
    "allergies": [
      "NKDA"
    ],
    "medications": [
      {
        "name": "Furosemide",
        "dose": "20 mg",
        "freq": "Daily"
      }
    ],
    "aiSummary": "28F, chf. Watch for fluid overload; weigh daily."
  },
  {
    "id": "MRN-04254",
    "name": "Kai Walsh",
    "age": 29,
    "sex": "F",
    "status": "observation",
    "risk": "high",
    "riskScore": 75,
    "condition": "Asthma",
    "careTeam": "c2",
    "room": "218",
    "location": "Day Unit",
    "lastSeen": "2026-06-28T01:30:00Z",
    "nextAppt": "2026-07-04T19:30:00Z",
    "insurer": "Cigna",
    "flags": [
      {
        "id": "MRN-04254-f0",
        "kind": "ai",
        "severity": "high",
        "message": "Care-gap: overdue A1c",
        "at": "2026-06-29T01:30:00Z"
      }
    ],
    "vitals": [
      {
        "label": "HR",
        "value": "100",
        "unit": "bpm",
        "trend": "flat",
        "state": "watch"
      },
      {
        "label": "BP",
        "value": "155/98",
        "unit": "mmHg",
        "trend": "up",
        "state": "watch"
      },
      {
        "label": "SpO₂",
        "value": "95",
        "unit": "%",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "Temp",
        "value": "37.6",
        "unit": "°C",
        "trend": "up",
        "state": "watch"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04254-t5",
        "at": "2026-06-22T15:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Adjusted per protocol",
        "author": "Dr. E. Vance"
      },
      {
        "id": "MRN-04254-t0",
        "at": "2026-06-22T04:30:00Z",
        "type": "note",
        "title": "Progress note",
        "detail": "Flagged for review",
        "author": "Dr. N. Okafor"
      },
      {
        "id": "MRN-04254-t6",
        "at": "2026-06-20T11:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Adjusted per protocol",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04254-t4",
        "at": "2026-06-14T12:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Flagged for review",
        "author": "Dr. N. Okafor"
      },
      {
        "id": "MRN-04254-t1",
        "at": "2026-06-13T00:30:00Z",
        "type": "note",
        "title": "Progress note",
        "detail": "Routine follow-up",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04254-t3",
        "at": "2026-06-02T21:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Adjusted per protocol",
        "author": "Dr. N. Okafor"
      },
      {
        "id": "MRN-04254-t2",
        "at": "2026-06-02T10:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Flagged for review",
        "author": "AFIA"
      }
    ],
    "allergies": [
      "NKDA"
    ],
    "medications": [
      {
        "name": "Insulin glargine",
        "dose": "18 U",
        "freq": "Nightly"
      }
    ],
    "aiSummary": "29F, asthma. Recent vitals within acceptable range."
  },
  {
    "id": "MRN-04100",
    "name": "Selma Becker",
    "age": 36,
    "sex": "F",
    "status": "admitted",
    "risk": "high",
    "riskScore": 73,
    "condition": "Type 2 Diabetes",
    "careTeam": "c3",
    "room": "412",
    "location": "Telemetry",
    "lastSeen": "2026-06-29T12:30:00Z",
    "nextAppt": undefined,
    "insurer": "Aetna",
    "flags": [
      {
        "id": "MRN-04100-f0",
        "kind": "lab",
        "severity": "moderate",
        "message": "Creatinine rising vs baseline",
        "at": "2026-06-30T08:30:00Z"
      }
    ],
    "vitals": [
      {
        "label": "HR",
        "value": "98",
        "unit": "bpm",
        "trend": "down",
        "state": "watch"
      },
      {
        "label": "BP",
        "value": "149/94",
        "unit": "mmHg",
        "trend": "up",
        "state": "watch"
      },
      {
        "label": "SpO₂",
        "value": "94",
        "unit": "%",
        "trend": "flat",
        "state": "watch"
      },
      {
        "label": "Temp",
        "value": "37.7",
        "unit": "°C",
        "trend": "up",
        "state": "watch"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04100-t6",
        "at": "2026-06-28T00:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Flagged for review",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04100-t3",
        "at": "2026-06-27T10:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Reviewed by care team",
        "author": "Dr. N. Okafor"
      },
      {
        "id": "MRN-04100-t2",
        "at": "2026-06-24T17:30:00Z",
        "type": "note",
        "title": "Progress note",
        "detail": "Stable, continue plan",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04100-t1",
        "at": "2026-06-24T13:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Reviewed by care team",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04100-t4",
        "at": "2026-06-16T16:30:00Z",
        "type": "note",
        "title": "Progress note",
        "detail": "Flagged for review",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04100-t0",
        "at": "2026-06-12T05:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Flagged for review",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04100-t5",
        "at": "2026-06-11T18:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Flagged for review",
        "author": "Dr. N. Okafor"
      }
    ],
    "allergies": [
      "Peanuts",
      "NKDA"
    ],
    "medications": [
      {
        "name": "Metformin",
        "dose": "500 mg",
        "freq": "BID"
      }
    ],
    "aiSummary": "36F, type 2 diabetes. Watch for fluid overload; weigh daily."
  },
  {
    "id": "MRN-04212",
    "name": "Dev Vasquez",
    "age": 31,
    "sex": "X",
    "status": "discharged",
    "risk": "high",
    "riskScore": 69,
    "condition": "CHF",
    "careTeam": "c1",
    "room": undefined,
    "location": "Ward 4B",
    "lastSeen": "2026-06-21T15:30:00Z",
    "nextAppt": "2026-07-04T12:30:00Z",
    "insurer": "Kaiser",
    "flags": [
      {
        "id": "MRN-04212-f0",
        "kind": "ai",
        "severity": "high",
        "message": "Pattern matches early sepsis criteria",
        "at": "2026-06-29T07:30:00Z"
      }
    ],
    "vitals": [
      {
        "label": "HR",
        "value": "104",
        "unit": "bpm",
        "trend": "up",
        "state": "watch"
      },
      {
        "label": "BP",
        "value": "146/92",
        "unit": "mmHg",
        "trend": "up",
        "state": "watch"
      },
      {
        "label": "SpO₂",
        "value": "93",
        "unit": "%",
        "trend": "flat",
        "state": "watch"
      },
      {
        "label": "Temp",
        "value": "37.8",
        "unit": "°C",
        "trend": "up",
        "state": "watch"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04212-t2",
        "at": "2026-06-05T00:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Routine follow-up",
        "author": "Dr. E. Vance"
      },
      {
        "id": "MRN-04212-t1",
        "at": "2026-06-04T15:30:00Z",
        "type": "note",
        "title": "Progress note",
        "detail": "Reviewed by care team",
        "author": "Dr. P. Nadar"
      },
      {
        "id": "MRN-04212-t0",
        "at": "2026-06-02T14:30:00Z",
        "type": "note",
        "title": "Progress note",
        "detail": "Flagged for review",
        "author": "AFIA"
      },
      {
        "id": "MRN-04212-t3",
        "at": "2026-06-02T04:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Adjusted per protocol",
        "author": "Dr. E. Vance"
      }
    ],
    "allergies": [
      "NKDA"
    ],
    "medications": [
      {
        "name": "Lisinopril",
        "dose": "10 mg",
        "freq": "Daily"
      },
      {
        "name": "Amlodipine",
        "dose": "5 mg",
        "freq": "Daily"
      },
      {
        "name": "Atorvastatin",
        "dose": "40 mg",
        "freq": "Nightly"
      },
      {
        "name": "Insulin glargine",
        "dose": "18 U",
        "freq": "Nightly"
      }
    ],
    "aiSummary": "31X, chf. Glycemic control improving on current regimen."
  },
  {
    "id": "MRN-04156",
    "name": "Diego Albright",
    "age": 28,
    "sex": "F",
    "status": "follow-up",
    "risk": "moderate",
    "riskScore": 53,
    "condition": "Atrial Fibrillation",
    "careTeam": "c5",
    "room": undefined,
    "location": "Ward 2A",
    "lastSeen": "2026-06-22T12:30:00Z",
    "nextAppt": "2026-07-13T17:30:00Z",
    "insurer": "BlueCross",
    "flags": [
      {
        "id": "MRN-04156-f0",
        "kind": "ai",
        "severity": "moderate",
        "message": "AFIA predicts 18% readmission risk",
        "at": "2026-07-01T09:30:00Z"
      },
      {
        "id": "MRN-04156-f1",
        "kind": "vitals",
        "severity": "moderate",
        "message": "SpO₂ trending down over 3 readings",
        "at": "2026-06-28T15:30:00Z"
      }
    ],
    "vitals": [
      {
        "label": "HR",
        "value": "80",
        "unit": "bpm",
        "trend": "up",
        "state": "normal"
      },
      {
        "label": "BP",
        "value": "132/81",
        "unit": "mmHg",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "SpO₂",
        "value": "96",
        "unit": "%",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "Temp",
        "value": "37.2",
        "unit": "°C",
        "trend": "flat",
        "state": "normal"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04156-t1",
        "at": "2026-06-25T16:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Reviewed by care team",
        "author": "Dr. P. Nadar"
      },
      {
        "id": "MRN-04156-t4",
        "at": "2026-06-24T14:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Reviewed by care team",
        "author": "AFIA"
      },
      {
        "id": "MRN-04156-t5",
        "at": "2026-06-20T19:30:00Z",
        "type": "note",
        "title": "Progress note",
        "detail": "Adjusted per protocol",
        "author": "Dr. P. Nadar"
      },
      {
        "id": "MRN-04156-t3",
        "at": "2026-06-09T20:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Reviewed by care team",
        "author": "Dr. P. Nadar"
      },
      {
        "id": "MRN-04156-t0",
        "at": "2026-06-07T14:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Stable, continue plan",
        "author": "Dr. N. Okafor"
      },
      {
        "id": "MRN-04156-t2",
        "at": "2026-06-05T23:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Adjusted per protocol",
        "author": "AFIA"
      },
      {
        "id": "MRN-04156-t6",
        "at": "2026-06-04T15:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Stable, continue plan",
        "author": "S. Whitfield, NP"
      }
    ],
    "allergies": [
      "Sulfa",
      "NKDA",
      "Latex"
    ],
    "medications": [
      {
        "name": "Albuterol",
        "dose": "90 mcg",
        "freq": "PRN"
      },
      {
        "name": "Furosemide",
        "dose": "20 mg",
        "freq": "Daily"
      }
    ],
    "aiSummary": "28F, atrial fibrillation. Glycemic control improving on current regimen."
  },
  {
    "id": "MRN-04282",
    "name": "Knut Sato",
    "age": 36,
    "sex": "M",
    "status": "follow-up",
    "risk": "moderate",
    "riskScore": 44,
    "condition": "Sepsis (resolving)",
    "careTeam": "c2",
    "room": undefined,
    "location": "ICU",
    "lastSeen": "2026-06-30T06:30:00Z",
    "nextAppt": "2026-07-11T17:30:00Z",
    "insurer": "Self-pay",
    "flags": [
      {
        "id": "MRN-04282-f0",
        "kind": "admin",
        "severity": "high",
        "message": "Insurance auth expiring in 2 days",
        "at": "2026-06-30T13:30:00Z"
      },
      {
        "id": "MRN-04282-f1",
        "kind": "medication",
        "severity": "moderate",
        "message": "Renal dosing review needed",
        "at": "2026-06-30T15:30:00Z"
      }
    ],
    "vitals": [
      {
        "label": "HR",
        "value": "79",
        "unit": "bpm",
        "trend": "up",
        "state": "normal"
      },
      {
        "label": "BP",
        "value": "129/81",
        "unit": "mmHg",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "SpO₂",
        "value": "97",
        "unit": "%",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "Temp",
        "value": "36.9",
        "unit": "°C",
        "trend": "up",
        "state": "normal"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04282-t5",
        "at": "2026-06-29T17:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Adjusted per protocol",
        "author": "AFIA"
      },
      {
        "id": "MRN-04282-t4",
        "at": "2026-06-27T03:30:00Z",
        "type": "note",
        "title": "Progress note",
        "detail": "Adjusted per protocol",
        "author": "Dr. E. Vance"
      },
      {
        "id": "MRN-04282-t6",
        "at": "2026-06-25T10:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Reviewed by care team",
        "author": "AFIA"
      },
      {
        "id": "MRN-04282-t0",
        "at": "2026-06-21T21:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Reviewed by care team",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04282-t2",
        "at": "2026-06-15T10:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Stable, continue plan",
        "author": "AFIA"
      },
      {
        "id": "MRN-04282-t3",
        "at": "2026-06-15T09:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Stable, continue plan",
        "author": "Dr. N. Okafor"
      },
      {
        "id": "MRN-04282-t1",
        "at": "2026-06-13T16:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Routine follow-up",
        "author": "AFIA"
      }
    ],
    "allergies": [
      "NKDA"
    ],
    "medications": [
      {
        "name": "Metformin",
        "dose": "500 mg",
        "freq": "BID"
      }
    ],
    "aiSummary": "36M, sepsis (resolving). Glycemic control improving on current regimen."
  },
  {
    "id": "MRN-04107",
    "name": "Mira Engel",
    "age": 67,
    "sex": "M",
    "status": "discharged",
    "risk": "moderate",
    "riskScore": 43,
    "condition": "Asthma",
    "careTeam": "c6",
    "room": undefined,
    "location": "Day Unit",
    "lastSeen": "2026-06-26T16:30:00Z",
    "nextAppt": undefined,
    "insurer": "Aetna",
    "flags": [],
    "vitals": [
      {
        "label": "HR",
        "value": "84",
        "unit": "bpm",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "BP",
        "value": "135/88",
        "unit": "mmHg",
        "trend": "up",
        "state": "normal"
      },
      {
        "label": "SpO₂",
        "value": "97",
        "unit": "%",
        "trend": "down",
        "state": "normal"
      },
      {
        "label": "Temp",
        "value": "37.1",
        "unit": "°C",
        "trend": "flat",
        "state": "normal"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04107-t0",
        "at": "2026-06-28T13:30:00Z",
        "type": "note",
        "title": "Progress note",
        "detail": "Stable, continue plan",
        "author": "Dr. P. Nadar"
      },
      {
        "id": "MRN-04107-t3",
        "at": "2026-06-25T10:30:00Z",
        "type": "note",
        "title": "Progress note",
        "detail": "Stable, continue plan",
        "author": "Dr. P. Nadar"
      },
      {
        "id": "MRN-04107-t4",
        "at": "2026-06-20T03:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Flagged for review",
        "author": "AFIA"
      },
      {
        "id": "MRN-04107-t1",
        "at": "2026-06-17T22:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Stable, continue plan",
        "author": "AFIA"
      },
      {
        "id": "MRN-04107-t5",
        "at": "2026-06-14T08:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Adjusted per protocol",
        "author": "Dr. E. Vance"
      },
      {
        "id": "MRN-04107-t6",
        "at": "2026-06-09T15:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Reviewed by care team",
        "author": "Dr. N. Okafor"
      },
      {
        "id": "MRN-04107-t2",
        "at": "2026-06-03T22:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Reviewed by care team",
        "author": "Dr. E. Vance"
      }
    ],
    "allergies": [
      "NKDA"
    ],
    "medications": [
      {
        "name": "Apixaban",
        "dose": "5 mg",
        "freq": "BID"
      }
    ],
    "aiSummary": "67M, asthma. Watch for fluid overload; weigh daily."
  },
  {
    "id": "MRN-04289",
    "name": "Jonah Iyer",
    "age": 73,
    "sex": "F",
    "status": "observation",
    "risk": "moderate",
    "riskScore": 42,
    "condition": "Type 2 Diabetes",
    "careTeam": "c5",
    "room": "305",
    "location": "Clinic — East",
    "lastSeen": "2026-06-23T20:30:00Z",
    "nextAppt": "2026-07-06T14:30:00Z",
    "insurer": "BlueCross",
    "flags": [],
    "vitals": [
      {
        "label": "HR",
        "value": "78",
        "unit": "bpm",
        "trend": "up",
        "state": "normal"
      },
      {
        "label": "BP",
        "value": "134/85",
        "unit": "mmHg",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "SpO₂",
        "value": "97",
        "unit": "%",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "Temp",
        "value": "37.2",
        "unit": "°C",
        "trend": "up",
        "state": "normal"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04289-t0",
        "at": "2026-06-15T23:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Routine follow-up",
        "author": "Dr. P. Nadar"
      },
      {
        "id": "MRN-04289-t3",
        "at": "2026-06-14T20:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Adjusted per protocol",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04289-t2",
        "at": "2026-06-14T17:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Reviewed by care team",
        "author": "Dr. N. Okafor"
      },
      {
        "id": "MRN-04289-t1",
        "at": "2026-06-09T17:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Flagged for review",
        "author": "Dr. P. Nadar"
      }
    ],
    "allergies": [
      "NKDA"
    ],
    "medications": [
      {
        "name": "Lisinopril",
        "dose": "10 mg",
        "freq": "Daily"
      },
      {
        "name": "Furosemide",
        "dose": "20 mg",
        "freq": "Daily"
      },
      {
        "name": "Amlodipine",
        "dose": "5 mg",
        "freq": "Daily"
      }
    ],
    "aiSummary": "73F, type 2 diabetes. Trending stable; monitor labs at next visit."
  },
  {
    "id": "MRN-04191",
    "name": "Ruth Silva",
    "age": 72,
    "sex": "X",
    "status": "follow-up",
    "risk": "moderate",
    "riskScore": 41,
    "condition": "COPD",
    "careTeam": "c3",
    "room": undefined,
    "location": "Telemetry",
    "lastSeen": "2026-06-26T13:30:00Z",
    "nextAppt": "2026-07-12T14:30:00Z",
    "insurer": "Self-pay",
    "flags": [
      {
        "id": "MRN-04191-f0",
        "kind": "admin",
        "severity": "high",
        "message": "Consent form unsigned",
        "at": "2026-07-01T02:30:00Z"
      }
    ],
    "vitals": [
      {
        "label": "HR",
        "value": "79",
        "unit": "bpm",
        "trend": "up",
        "state": "normal"
      },
      {
        "label": "BP",
        "value": "129/79",
        "unit": "mmHg",
        "trend": "up",
        "state": "normal"
      },
      {
        "label": "SpO₂",
        "value": "98",
        "unit": "%",
        "trend": "down",
        "state": "normal"
      },
      {
        "label": "Temp",
        "value": "37.3",
        "unit": "°C",
        "trend": "up",
        "state": "normal"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04191-t1",
        "at": "2026-06-27T21:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Stable, continue plan",
        "author": "Dr. E. Vance"
      },
      {
        "id": "MRN-04191-t3",
        "at": "2026-06-13T22:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Reviewed by care team",
        "author": "Dr. P. Nadar"
      },
      {
        "id": "MRN-04191-t2",
        "at": "2026-06-07T19:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Routine follow-up",
        "author": "Dr. E. Vance"
      },
      {
        "id": "MRN-04191-t0",
        "at": "2026-06-04T16:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Stable, continue plan",
        "author": "S. Whitfield, NP"
      }
    ],
    "allergies": [
      "Iodine contrast",
      "Penicillin",
      "Sulfa"
    ],
    "medications": [
      {
        "name": "Albuterol",
        "dose": "90 mcg",
        "freq": "PRN"
      },
      {
        "name": "Insulin glargine",
        "dose": "18 U",
        "freq": "Nightly"
      },
      {
        "name": "Metformin",
        "dose": "500 mg",
        "freq": "BID"
      }
    ],
    "aiSummary": "72X, copd. Watch for fluid overload; weigh daily."
  },
  {
    "id": "MRN-04275",
    "name": "Arlo Castle",
    "age": 67,
    "sex": "M",
    "status": "observation",
    "risk": "moderate",
    "riskScore": 40,
    "condition": "Epilepsy",
    "careTeam": "c2",
    "room": "—",
    "location": "Telemetry",
    "lastSeen": "2026-06-28T15:30:00Z",
    "nextAppt": "2026-07-12T16:30:00Z",
    "insurer": "UnitedHealth",
    "flags": [
      {
        "id": "MRN-04275-f0",
        "kind": "admin",
        "severity": "moderate",
        "message": "Missing discharge summary",
        "at": "2026-06-29T18:30:00Z"
      },
      {
        "id": "MRN-04275-f1",
        "kind": "lab",
        "severity": "high",
        "message": "HbA1c 9.1% — above goal",
        "at": "2026-06-30T09:30:00Z"
      }
    ],
    "vitals": [
      {
        "label": "HR",
        "value": "90",
        "unit": "bpm",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "BP",
        "value": "140/87",
        "unit": "mmHg",
        "trend": "flat",
        "state": "watch"
      },
      {
        "label": "SpO₂",
        "value": "97",
        "unit": "%",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "Temp",
        "value": "37.0",
        "unit": "°C",
        "trend": "flat",
        "state": "normal"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04275-t0",
        "at": "2026-06-24T18:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Routine follow-up",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04275-t4",
        "at": "2026-06-23T15:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Flagged for review",
        "author": "Dr. E. Vance"
      },
      {
        "id": "MRN-04275-t1",
        "at": "2026-06-09T17:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Flagged for review",
        "author": "Dr. P. Nadar"
      },
      {
        "id": "MRN-04275-t3",
        "at": "2026-06-05T21:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Reviewed by care team",
        "author": "Dr. E. Vance"
      },
      {
        "id": "MRN-04275-t2",
        "at": "2026-06-03T03:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Adjusted per protocol",
        "author": "Dr. P. Nadar"
      }
    ],
    "allergies": [
      "Penicillin",
      "Peanuts",
      "Latex"
    ],
    "medications": [
      {
        "name": "Insulin glargine",
        "dose": "18 U",
        "freq": "Nightly"
      },
      {
        "name": "Albuterol",
        "dose": "90 mcg",
        "freq": "PRN"
      }
    ],
    "aiSummary": "67M, epilepsy. Recent vitals within acceptable range."
  },
  {
    "id": "MRN-04268",
    "name": "Tariq Rahman",
    "age": 78,
    "sex": "X",
    "status": "discharged",
    "risk": "low",
    "riskScore": 26,
    "condition": "COPD",
    "careTeam": "c3",
    "room": undefined,
    "location": "Ward 2A",
    "lastSeen": "2026-06-30T11:30:00Z",
    "nextAppt": "2026-07-13T15:30:00Z",
    "insurer": "Self-pay",
    "flags": [],
    "vitals": [
      {
        "label": "HR",
        "value": "70",
        "unit": "bpm",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "BP",
        "value": "123/75",
        "unit": "mmHg",
        "trend": "up",
        "state": "normal"
      },
      {
        "label": "SpO₂",
        "value": "99",
        "unit": "%",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "Temp",
        "value": "36.7",
        "unit": "°C",
        "trend": "flat",
        "state": "normal"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04268-t1",
        "at": "2026-06-27T18:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Flagged for review",
        "author": "Dr. E. Vance"
      },
      {
        "id": "MRN-04268-t2",
        "at": "2026-06-20T19:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Reviewed by care team",
        "author": "AFIA"
      },
      {
        "id": "MRN-04268-t4",
        "at": "2026-06-15T11:30:00Z",
        "type": "note",
        "title": "Progress note",
        "detail": "Adjusted per protocol",
        "author": "AFIA"
      },
      {
        "id": "MRN-04268-t0",
        "at": "2026-06-12T03:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Routine follow-up",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04268-t3",
        "at": "2026-06-09T01:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Flagged for review",
        "author": "Dr. E. Vance"
      }
    ],
    "allergies": [
      "NKDA",
      "Codeine",
      "Iodine contrast"
    ],
    "medications": [
      {
        "name": "Furosemide",
        "dose": "20 mg",
        "freq": "Daily"
      }
    ],
    "aiSummary": "78X, copd. Trending stable; monitor labs at next visit."
  },
  {
    "id": "MRN-04149",
    "name": "Ruth Lindqvist",
    "age": 85,
    "sex": "X",
    "status": "active",
    "risk": "low",
    "riskScore": 23,
    "condition": "Post-op recovery",
    "careTeam": "c6",
    "room": undefined,
    "location": "Ward 2A",
    "lastSeen": "2026-06-27T04:30:00Z",
    "nextAppt": "2026-07-09T05:30:00Z",
    "insurer": "UnitedHealth",
    "flags": [
      {
        "id": "MRN-04149-f0",
        "kind": "admin",
        "severity": "low",
        "message": "Insurance auth expiring in 2 days",
        "at": "2026-06-29T19:30:00Z"
      }
    ],
    "vitals": [
      {
        "label": "HR",
        "value": "74",
        "unit": "bpm",
        "trend": "up",
        "state": "normal"
      },
      {
        "label": "BP",
        "value": "122/77",
        "unit": "mmHg",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "SpO₂",
        "value": "100",
        "unit": "%",
        "trend": "down",
        "state": "normal"
      },
      {
        "label": "Temp",
        "value": "36.5",
        "unit": "°C",
        "trend": "up",
        "state": "normal"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04149-t4",
        "at": "2026-07-01T08:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Adjusted per protocol",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04149-t1",
        "at": "2026-06-18T18:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Flagged for review",
        "author": "Dr. E. Vance"
      },
      {
        "id": "MRN-04149-t0",
        "at": "2026-06-13T22:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Adjusted per protocol",
        "author": "AFIA"
      },
      {
        "id": "MRN-04149-t2",
        "at": "2026-06-13T10:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Reviewed by care team",
        "author": "Dr. E. Vance"
      },
      {
        "id": "MRN-04149-t5",
        "at": "2026-06-13T00:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Flagged for review",
        "author": "Dr. P. Nadar"
      },
      {
        "id": "MRN-04149-t3",
        "at": "2026-06-07T02:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Adjusted per protocol",
        "author": "AFIA"
      }
    ],
    "allergies": [
      "Codeine",
      "Peanuts"
    ],
    "medications": [
      {
        "name": "Atorvastatin",
        "dose": "40 mg",
        "freq": "Nightly"
      },
      {
        "name": "Insulin glargine",
        "dose": "18 U",
        "freq": "Nightly"
      },
      {
        "name": "Levothyroxine",
        "dose": "75 mcg",
        "freq": "Daily"
      },
      {
        "name": "Furosemide",
        "dose": "20 mg",
        "freq": "Daily"
      }
    ],
    "aiSummary": "85X, post-op recovery. Watch for fluid overload; weigh daily."
  },
  {
    "id": "MRN-04177",
    "name": "Mara Khan",
    "age": 77,
    "sex": "M",
    "status": "observation",
    "risk": "low",
    "riskScore": 23,
    "condition": "Pre-diabetes",
    "careTeam": "c4",
    "room": "—",
    "location": "Telemetry",
    "lastSeen": "2026-06-22T02:30:00Z",
    "nextAppt": "2026-07-05T05:30:00Z",
    "insurer": "Medicare",
    "flags": [
      {
        "id": "MRN-04177-f0",
        "kind": "ai",
        "severity": "low",
        "message": "Care-gap: overdue A1c",
        "at": "2026-06-29T23:30:00Z"
      }
    ],
    "vitals": [
      {
        "label": "HR",
        "value": "76",
        "unit": "bpm",
        "trend": "up",
        "state": "normal"
      },
      {
        "label": "BP",
        "value": "119/77",
        "unit": "mmHg",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "SpO₂",
        "value": "100",
        "unit": "%",
        "trend": "down",
        "state": "normal"
      },
      {
        "label": "Temp",
        "value": "36.9",
        "unit": "°C",
        "trend": "flat",
        "state": "normal"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04177-t0",
        "at": "2026-06-27T16:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Adjusted per protocol",
        "author": "AFIA"
      },
      {
        "id": "MRN-04177-t3",
        "at": "2026-06-17T12:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Stable, continue plan",
        "author": "AFIA"
      },
      {
        "id": "MRN-04177-t4",
        "at": "2026-06-16T05:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Adjusted per protocol",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04177-t2",
        "at": "2026-06-15T04:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Adjusted per protocol",
        "author": "Dr. N. Okafor"
      },
      {
        "id": "MRN-04177-t1",
        "at": "2026-06-11T13:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Flagged for review",
        "author": "Dr. P. Nadar"
      },
      {
        "id": "MRN-04177-t5",
        "at": "2026-06-05T22:30:00Z",
        "type": "note",
        "title": "Progress note",
        "detail": "Adjusted per protocol",
        "author": "Dr. P. Nadar"
      }
    ],
    "allergies": [
      "NKDA"
    ],
    "medications": [
      {
        "name": "Lisinopril",
        "dose": "10 mg",
        "freq": "Daily"
      },
      {
        "name": "Atorvastatin",
        "dose": "40 mg",
        "freq": "Nightly"
      }
    ],
    "aiSummary": "77M, pre-diabetes. Recent vitals within acceptable range."
  },
  {
    "id": "MRN-04121",
    "name": "Jonah Kapoor",
    "age": 89,
    "sex": "M",
    "status": "active",
    "risk": "low",
    "riskScore": 20,
    "condition": "CKD Stage 3",
    "careTeam": "c1",
    "room": undefined,
    "location": "Telemetry",
    "lastSeen": "2026-06-26T16:30:00Z",
    "nextAppt": "2026-07-01T14:30:00Z",
    "insurer": "Cigna",
    "flags": [],
    "vitals": [
      {
        "label": "HR",
        "value": "69",
        "unit": "bpm",
        "trend": "down",
        "state": "normal"
      },
      {
        "label": "BP",
        "value": "119/72",
        "unit": "mmHg",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "SpO₂",
        "value": "100",
        "unit": "%",
        "trend": "down",
        "state": "normal"
      },
      {
        "label": "Temp",
        "value": "36.7",
        "unit": "°C",
        "trend": "up",
        "state": "normal"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04121-t0",
        "at": "2026-06-30T00:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Adjusted per protocol",
        "author": "Dr. N. Okafor"
      },
      {
        "id": "MRN-04121-t4",
        "at": "2026-06-23T06:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Routine follow-up",
        "author": "Dr. N. Okafor"
      },
      {
        "id": "MRN-04121-t1",
        "at": "2026-06-21T05:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Adjusted per protocol",
        "author": "AFIA"
      },
      {
        "id": "MRN-04121-t3",
        "at": "2026-06-11T04:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Stable, continue plan",
        "author": "AFIA"
      },
      {
        "id": "MRN-04121-t2",
        "at": "2026-06-08T08:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Stable, continue plan",
        "author": "Dr. P. Nadar"
      }
    ],
    "allergies": [
      "NKDA",
      "Peanuts",
      "Aspirin"
    ],
    "medications": [
      {
        "name": "Metformin",
        "dose": "500 mg",
        "freq": "BID"
      },
      {
        "name": "Lisinopril",
        "dose": "10 mg",
        "freq": "Daily"
      },
      {
        "name": "Amlodipine",
        "dose": "5 mg",
        "freq": "Daily"
      },
      {
        "name": "Atorvastatin",
        "dose": "40 mg",
        "freq": "Nightly"
      }
    ],
    "aiSummary": "89M, ckd stage 3. Glycemic control improving on current regimen."
  },
  {
    "id": "MRN-04114",
    "name": "Knut Pereira",
    "age": 39,
    "sex": "F",
    "status": "discharged",
    "risk": "low",
    "riskScore": 19,
    "condition": "Anemia",
    "careTeam": "c2",
    "room": undefined,
    "location": "Clinic — West",
    "lastSeen": "2026-07-01T07:30:00Z",
    "nextAppt": undefined,
    "insurer": "Self-pay",
    "flags": [
      {
        "id": "MRN-04114-f0",
        "kind": "vitals",
        "severity": "high",
        "message": "BP above target range",
        "at": "2026-06-28T17:30:00Z"
      }
    ],
    "vitals": [
      {
        "label": "HR",
        "value": "69",
        "unit": "bpm",
        "trend": "down",
        "state": "normal"
      },
      {
        "label": "BP",
        "value": "124/77",
        "unit": "mmHg",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "SpO₂",
        "value": "100",
        "unit": "%",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "Temp",
        "value": "36.9",
        "unit": "°C",
        "trend": "flat",
        "state": "normal"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04114-t1",
        "at": "2026-07-01T08:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Flagged for review",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04114-t2",
        "at": "2026-06-30T13:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Routine follow-up",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04114-t4",
        "at": "2026-06-28T00:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Routine follow-up",
        "author": "AFIA"
      },
      {
        "id": "MRN-04114-t3",
        "at": "2026-06-21T03:30:00Z",
        "type": "note",
        "title": "Progress note",
        "detail": "Routine follow-up",
        "author": "Dr. E. Vance"
      },
      {
        "id": "MRN-04114-t0",
        "at": "2026-06-15T10:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Stable, continue plan",
        "author": "Dr. P. Nadar"
      }
    ],
    "allergies": [
      "NKDA"
    ],
    "medications": [
      {
        "name": "Apixaban",
        "dose": "5 mg",
        "freq": "BID"
      },
      {
        "name": "Insulin glargine",
        "dose": "18 U",
        "freq": "Nightly"
      }
    ],
    "aiSummary": "39F, anemia. Flagged for care-team review this week."
  },
  {
    "id": "MRN-04247",
    "name": "Zara Berg",
    "age": 58,
    "sex": "M",
    "status": "follow-up",
    "risk": "low",
    "riskScore": 19,
    "condition": "Sepsis (resolving)",
    "careTeam": "c2",
    "room": undefined,
    "location": "Day Unit",
    "lastSeen": "2026-06-29T03:30:00Z",
    "nextAppt": "2026-07-13T18:30:00Z",
    "insurer": "Aetna",
    "flags": [],
    "vitals": [
      {
        "label": "HR",
        "value": "68",
        "unit": "bpm",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "BP",
        "value": "122/72",
        "unit": "mmHg",
        "trend": "up",
        "state": "normal"
      },
      {
        "label": "SpO₂",
        "value": "100",
        "unit": "%",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "Temp",
        "value": "36.5",
        "unit": "°C",
        "trend": "flat",
        "state": "normal"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04247-t1",
        "at": "2026-06-19T11:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Flagged for review",
        "author": "Dr. E. Vance"
      },
      {
        "id": "MRN-04247-t0",
        "at": "2026-06-16T10:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Flagged for review",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04247-t2",
        "at": "2026-06-07T10:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Flagged for review",
        "author": "Dr. P. Nadar"
      },
      {
        "id": "MRN-04247-t3",
        "at": "2026-06-03T22:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Flagged for review",
        "author": "Dr. N. Okafor"
      },
      {
        "id": "MRN-04247-t4",
        "at": "2026-06-03T07:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Adjusted per protocol",
        "author": "Dr. N. Okafor"
      }
    ],
    "allergies": [
      "Iodine contrast"
    ],
    "medications": [
      {
        "name": "Furosemide",
        "dose": "20 mg",
        "freq": "Daily"
      },
      {
        "name": "Amlodipine",
        "dose": "5 mg",
        "freq": "Daily"
      },
      {
        "name": "Metformin",
        "dose": "500 mg",
        "freq": "BID"
      }
    ],
    "aiSummary": "58M, sepsis (resolving). Watch for fluid overload; weigh daily."
  },
  {
    "id": "MRN-04205",
    "name": "Bjorn Quinn",
    "age": 78,
    "sex": "F",
    "status": "active",
    "risk": "low",
    "riskScore": 17,
    "condition": "Sepsis (resolving)",
    "careTeam": "c5",
    "room": undefined,
    "location": "Day Unit",
    "lastSeen": "2026-06-28T02:30:00Z",
    "nextAppt": "2026-07-12T02:30:00Z",
    "insurer": "Cigna",
    "flags": [
      {
        "id": "MRN-04205-f0",
        "kind": "ai",
        "severity": "high",
        "message": "AFIA predicts 18% readmission risk",
        "at": "2026-06-28T23:30:00Z"
      }
    ],
    "vitals": [
      {
        "label": "HR",
        "value": "79",
        "unit": "bpm",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "BP",
        "value": "112/71",
        "unit": "mmHg",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "SpO₂",
        "value": "99",
        "unit": "%",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "Temp",
        "value": "36.9",
        "unit": "°C",
        "trend": "up",
        "state": "normal"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04205-t1",
        "at": "2026-06-25T13:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Routine follow-up",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04205-t0",
        "at": "2026-06-23T05:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Flagged for review",
        "author": "Dr. P. Nadar"
      },
      {
        "id": "MRN-04205-t3",
        "at": "2026-06-19T07:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Adjusted per protocol",
        "author": "Dr. P. Nadar"
      },
      {
        "id": "MRN-04205-t2",
        "at": "2026-06-16T20:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Flagged for review",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04205-t4",
        "at": "2026-06-03T05:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Reviewed by care team",
        "author": "Dr. E. Vance"
      }
    ],
    "allergies": [
      "Codeine",
      "Latex",
      "Aspirin"
    ],
    "medications": [
      {
        "name": "Insulin glargine",
        "dose": "18 U",
        "freq": "Nightly"
      },
      {
        "name": "Furosemide",
        "dose": "20 mg",
        "freq": "Daily"
      },
      {
        "name": "Levothyroxine",
        "dose": "75 mcg",
        "freq": "Daily"
      },
      {
        "name": "Lisinopril",
        "dose": "10 mg",
        "freq": "Daily"
      }
    ],
    "aiSummary": "78F, sepsis (resolving). Watch for fluid overload; weigh daily."
  },
  {
    "id": "MRN-04163",
    "name": "Cora Mercer",
    "age": 68,
    "sex": "X",
    "status": "discharged",
    "risk": "low",
    "riskScore": 16,
    "condition": "Sepsis (resolving)",
    "careTeam": "c4",
    "room": undefined,
    "location": "ICU",
    "lastSeen": "2026-06-30T22:30:00Z",
    "nextAppt": undefined,
    "insurer": "Meridian Health",
    "flags": [
      {
        "id": "MRN-04163-f0",
        "kind": "medication",
        "severity": "high",
        "message": "Renal dosing review needed",
        "at": "2026-06-28T12:30:00Z"
      }
    ],
    "vitals": [
      {
        "label": "HR",
        "value": "70",
        "unit": "bpm",
        "trend": "down",
        "state": "normal"
      },
      {
        "label": "BP",
        "value": "117/72",
        "unit": "mmHg",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "SpO₂",
        "value": "99",
        "unit": "%",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "Temp",
        "value": "36.7",
        "unit": "°C",
        "trend": "flat",
        "state": "normal"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04163-t1",
        "at": "2026-06-30T03:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Reviewed by care team",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04163-t3",
        "at": "2026-06-25T22:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Flagged for review",
        "author": "Dr. P. Nadar"
      },
      {
        "id": "MRN-04163-t0",
        "at": "2026-06-22T00:30:00Z",
        "type": "med",
        "title": "Medication adjusted",
        "detail": "Adjusted per protocol",
        "author": "AFIA"
      },
      {
        "id": "MRN-04163-t4",
        "at": "2026-06-14T13:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Flagged for review",
        "author": "Dr. P. Nadar"
      },
      {
        "id": "MRN-04163-t2",
        "at": "2026-06-02T09:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Reviewed by care team",
        "author": "Dr. E. Vance"
      }
    ],
    "allergies": [
      "NKDA"
    ],
    "medications": [
      {
        "name": "Levothyroxine",
        "dose": "75 mcg",
        "freq": "Daily"
      }
    ],
    "aiSummary": "68X, sepsis (resolving). Watch for fluid overload; weigh daily."
  },
  {
    "id": "MRN-04170",
    "name": "Clara Doyle",
    "age": 47,
    "sex": "F",
    "status": "observation",
    "risk": "low",
    "riskScore": 11,
    "condition": "Pre-diabetes",
    "careTeam": "c6",
    "room": "DU-2",
    "location": "Clinic — West",
    "lastSeen": "2026-06-30T12:30:00Z",
    "nextAppt": "2026-07-02T02:30:00Z",
    "insurer": "Aetna",
    "flags": [],
    "vitals": [
      {
        "label": "HR",
        "value": "78",
        "unit": "bpm",
        "trend": "down",
        "state": "normal"
      },
      {
        "label": "BP",
        "value": "124/74",
        "unit": "mmHg",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "SpO₂",
        "value": "100",
        "unit": "%",
        "trend": "down",
        "state": "normal"
      },
      {
        "label": "Temp",
        "value": "36.7",
        "unit": "°C",
        "trend": "flat",
        "state": "normal"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04170-t3",
        "at": "2026-06-26T11:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Stable, continue plan",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04170-t0",
        "at": "2026-06-25T23:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Reviewed by care team",
        "author": "Dr. N. Okafor"
      },
      {
        "id": "MRN-04170-t2",
        "at": "2026-06-24T05:30:00Z",
        "type": "note",
        "title": "Progress note",
        "detail": "Flagged for review",
        "author": "Dr. P. Nadar"
      },
      {
        "id": "MRN-04170-t1",
        "at": "2026-06-22T01:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Reviewed by care team",
        "author": "S. Whitfield, NP"
      },
      {
        "id": "MRN-04170-t4",
        "at": "2026-06-06T16:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Routine follow-up",
        "author": "S. Whitfield, NP"
      }
    ],
    "allergies": [
      "Aspirin",
      "NKDA",
      "Sulfa"
    ],
    "medications": [
      {
        "name": "Atorvastatin",
        "dose": "40 mg",
        "freq": "Nightly"
      }
    ],
    "aiSummary": "47F, pre-diabetes. Trending stable; monitor labs at next visit."
  },
  {
    "id": "MRN-04128",
    "name": "Leila Strand",
    "age": 49,
    "sex": "M",
    "status": "active",
    "risk": "low",
    "riskScore": 10,
    "condition": "Hypertension",
    "careTeam": "c5",
    "room": undefined,
    "location": "Ward 4B",
    "lastSeen": "2026-06-22T16:30:00Z",
    "nextAppt": "2026-07-11T19:30:00Z",
    "insurer": "Aetna",
    "flags": [
      {
        "id": "MRN-04128-f0",
        "kind": "lab",
        "severity": "low",
        "message": "HbA1c 9.1% — above goal",
        "at": "2026-06-30T00:30:00Z"
      }
    ],
    "vitals": [
      {
        "label": "HR",
        "value": "72",
        "unit": "bpm",
        "trend": "down",
        "state": "normal"
      },
      {
        "label": "BP",
        "value": "121/80",
        "unit": "mmHg",
        "trend": "up",
        "state": "normal"
      },
      {
        "label": "SpO₂",
        "value": "100",
        "unit": "%",
        "trend": "flat",
        "state": "normal"
      },
      {
        "label": "Temp",
        "value": "36.7",
        "unit": "°C",
        "trend": "up",
        "state": "normal"
      }
    ],
    "timeline": [
      {
        "id": "MRN-04128-t5",
        "at": "2026-06-28T22:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Flagged for review",
        "author": "Dr. N. Okafor"
      },
      {
        "id": "MRN-04128-t6",
        "at": "2026-06-28T10:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Flagged for review",
        "author": "Dr. N. Okafor"
      },
      {
        "id": "MRN-04128-t1",
        "at": "2026-06-23T06:30:00Z",
        "type": "lab",
        "title": "Lab panel resulted",
        "detail": "Adjusted per protocol",
        "author": "Dr. E. Vance"
      },
      {
        "id": "MRN-04128-t3",
        "at": "2026-06-17T23:30:00Z",
        "type": "message",
        "title": "Patient message",
        "detail": "Routine follow-up",
        "author": "Dr. N. Okafor"
      },
      {
        "id": "MRN-04128-t0",
        "at": "2026-06-13T07:30:00Z",
        "type": "note",
        "title": "Progress note",
        "detail": "Flagged for review",
        "author": "AFIA"
      },
      {
        "id": "MRN-04128-t4",
        "at": "2026-06-11T00:30:00Z",
        "type": "ai",
        "title": "AFIA insight",
        "detail": "Flagged for review",
        "author": "Dr. P. Nadar"
      },
      {
        "id": "MRN-04128-t2",
        "at": "2026-06-06T15:30:00Z",
        "type": "visit",
        "title": "Clinic visit",
        "detail": "Flagged for review",
        "author": "Dr. N. Okafor"
      }
    ],
    "allergies": [
      "Aspirin"
    ],
    "medications": [
      {
        "name": "Atorvastatin",
        "dose": "40 mg",
        "freq": "Nightly"
      }
    ],
    "aiSummary": "49M, hypertension. Flagged for care-team review this week."
  }
] as Patient[];

export const patientById = (id: string) => patients.find((p) => p.id === id);
