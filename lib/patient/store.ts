import type { CreatePatientInput, Patient } from "./types";

const patients = new Map<string, Patient>();

function createId(): string {
  return `pat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createPatient(input: CreatePatientInput): Patient {
  const patient: Patient = {
    id: createId(),
    name: input.name,
    createdAt: Date.now(),
  };
  patients.set(patient.id, patient);
  return patient;
}

export function getPatient(patientId: string): Patient | null {
  return patients.get(patientId) ?? null;
}

export function listPatients(): Patient[] {
  return Array.from(patients.values());
}
