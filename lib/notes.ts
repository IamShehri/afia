import type { ClinicalEvent } from "./clinical-event";
import { registerClinicalModule } from "./clinical-registry";

export type Note = {
  id: string;
  patientId: string;
  timestamp: string;
  body: string;
};

export function toClinicalEvent(note: Note): ClinicalEvent {
  return {
    id: note.id,
    module: "notes",
    patientId: note.patientId,
    timestamp: note.timestamp,
    type: "note",
    summary: note.body,
  };
}

export function listClinicalEventsForPatient(patientId: string): ClinicalEvent[] {
  return [];
}

registerClinicalModule({
  module: "notes",
  getEvents: listClinicalEventsForPatient,
});
