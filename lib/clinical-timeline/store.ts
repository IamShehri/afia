import type { ClinicalEvent, CreateClinicalEventInput } from "./types";

const timelines = new Map<string, ClinicalEvent[]>();

function createId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createClinicalEvent(input: CreateClinicalEventInput): ClinicalEvent {
  return {
    id: createId(),
    patientId: input.patientId,
    timestamp: input.timestamp,
    eventType: input.eventType,
    payload: input.payload,
  };
}

export function appendEvent(patientId: string, event: ClinicalEvent): void {
  if (event.patientId !== patientId) {
    throw new Error("Event patientId must match append target patientId");
  }

  const events = timelines.get(patientId) ?? [];
  events.push(event);
  timelines.set(patientId, events);
}

export function getPatientTimeline(patientId: string): ClinicalEvent[] {
  const events = timelines.get(patientId) ?? [];
  return events.slice().sort((a, b) => a.timestamp - b.timestamp);
}
