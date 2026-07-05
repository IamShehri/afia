import type { ClinicalEvent as TimelineClinicalEvent } from "./types";
import type { ClinicalEvent as RegistryClinicalEvent } from "../clinical-event";
import { registerClinicalModule } from "../clinical-registry";
import {
  appendEvent,
  createClinicalEvent,
  getPatientTimeline,
} from "./store";

export type { ClinicalEvent, CreateClinicalEventInput } from "./types";
export { appendEvent, createClinicalEvent, getPatientTimeline };

function toRegistryClinicalEvent(event: TimelineClinicalEvent): RegistryClinicalEvent {
  return {
    id: event.id,
    module: "clinical-timeline",
    patientId: event.patientId,
    timestamp: String(event.timestamp),
    type: event.eventType,
    summary: JSON.stringify(event.payload),
  };
}

function listClinicalEventsForPatient(patientId: string): RegistryClinicalEvent[] {
  return getPatientTimeline(patientId).map(toRegistryClinicalEvent);
}

registerClinicalModule({
  module: "clinical-timeline",
  getEvents: listClinicalEventsForPatient,
});
