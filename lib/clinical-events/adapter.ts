import type { ClinicalEvent as TimelineClinicalEvent } from "../clinical-timeline/types";
import type { ClinicalEvent } from "./types";

export function toTimelineClinicalEvent(event: ClinicalEvent): TimelineClinicalEvent {
  return {
    id: event.id,
    patientId: event.patientId,
    timestamp: event.timestamp,
    eventType: event.type,
    payload: event.payload,
  };
}
