import { createPatient as coreCreatePatient } from "../patient/index";
import type { CreatePatientInput, Patient } from "../patient/types";
import {
  createDiagnosisEvent as coreCreateDiagnosisEvent,
  createEncounterEvent as coreCreateEncounterEvent,
  createLabResultEvent as coreCreateLabResultEvent,
  createMedicationEvent as coreCreateMedicationEvent,
  createObservationEvent as coreCreateObservationEvent,
  createProcedureEvent as coreCreateProcedureEvent,
  toTimelineClinicalEvent as coreToTimelineClinicalEvent,
} from "../clinical-events/index";
import type {
  ClinicalEvent as SemanticClinicalEvent,
  CreateClinicalEventFactoryInput,
} from "../clinical-events/types";
import {
  appendEvent as coreAppendEvent,
  createClinicalEvent as coreCreateClinicalEvent,
} from "../clinical-timeline/index";
import type {
  ClinicalEvent as TimelineClinicalEvent,
  CreateClinicalEventInput,
} from "../clinical-timeline/types";
import {
  addEventToEncounter as coreAddEventToEncounter,
  createEncounter as coreCreateEncounter,
} from "../encounter/index";
import type { Encounter } from "../encounter/types";
import {
  addEncounterToEpisode as coreAddEncounterToEpisode,
  createEpisode as coreCreateEpisode,
} from "../episode/index";
import type { Episode } from "../episode/types";
import {
  getEpisodeClinicalGraph as coreGetEpisodeClinicalGraph,
  getPatientClinicalGraph as coreGetPatientClinicalGraph,
  getPatientUnifiedTimeline as coreGetPatientUnifiedTimeline,
} from "../query/index";
import type {
  EpisodeClinicalGraph,
  PatientClinicalGraph,
  UnifiedTimelineEntry,
} from "../query/types";
import {
  getEpisodeInsights as coreGetEpisodeInsights,
  getPatientActivityProfile as coreGetPatientActivityProfile,
  getPatientSummary as coreGetPatientSummary,
} from "../reasoning/index";
import type {
  EpisodeInsights,
  PatientActivityProfile,
  PatientSummary,
} from "../reasoning/types";
import { recordTrace } from "./store";
import type { TraceLayer } from "./types";

function trace(
  layer: TraceLayer,
  action: string,
  entityId?: string,
  meta?: Record<string, any>
): void {
  recordTrace({
    timestamp: Date.now(),
    layer,
    action,
    entityId,
    meta,
  });
}

export function createPatient(input: CreatePatientInput): Patient {
  const patient = coreCreatePatient(input);
  trace("patient", "createPatient", patient.id, { name: input.name });
  return patient;
}

function traceSemanticEvent(
  action: string,
  event: SemanticClinicalEvent
): void {
  trace("event", action, event.id, {
    patientId: event.patientId,
    type: event.type,
  });
}

export function createObservationEvent(
  input: CreateClinicalEventFactoryInput
): SemanticClinicalEvent {
  const event = coreCreateObservationEvent(input);
  traceSemanticEvent("createObservationEvent", event);
  return event;
}

export function createDiagnosisEvent(
  input: CreateClinicalEventFactoryInput
): SemanticClinicalEvent {
  const event = coreCreateDiagnosisEvent(input);
  traceSemanticEvent("createDiagnosisEvent", event);
  return event;
}

export function createMedicationEvent(
  input: CreateClinicalEventFactoryInput
): SemanticClinicalEvent {
  const event = coreCreateMedicationEvent(input);
  traceSemanticEvent("createMedicationEvent", event);
  return event;
}

export function createProcedureEvent(
  input: CreateClinicalEventFactoryInput
): SemanticClinicalEvent {
  const event = coreCreateProcedureEvent(input);
  traceSemanticEvent("createProcedureEvent", event);
  return event;
}

export function createEncounterEvent(
  input: CreateClinicalEventFactoryInput
): SemanticClinicalEvent {
  const event = coreCreateEncounterEvent(input);
  traceSemanticEvent("createEncounterEvent", event);
  return event;
}

export function createLabResultEvent(
  input: CreateClinicalEventFactoryInput
): SemanticClinicalEvent {
  const event = coreCreateLabResultEvent(input);
  traceSemanticEvent("createLabResultEvent", event);
  return event;
}

export function toTimelineClinicalEvent(
  event: SemanticClinicalEvent
): TimelineClinicalEvent {
  const timelineEvent = coreToTimelineClinicalEvent(event);
  trace("event", "toTimelineClinicalEvent", event.id, {
    patientId: event.patientId,
    eventType: timelineEvent.eventType,
  });
  return timelineEvent;
}

export function createClinicalEvent(
  input: CreateClinicalEventInput
): TimelineClinicalEvent {
  const event = coreCreateClinicalEvent(input);
  trace("event", "createClinicalEvent", event.id, {
    patientId: input.patientId,
    eventType: event.eventType,
  });
  return event;
}

export function appendEvent(
  patientId: string,
  event: TimelineClinicalEvent
): void {
  coreAppendEvent(patientId, event);
  trace("event", "appendEvent", event.id, { patientId });
}

export function createEncounter(patientId: string): Encounter {
  const encounter = coreCreateEncounter(patientId);
  trace("encounter", "createEncounter", encounter.id, { patientId });
  return encounter;
}

export function addEventToEncounter(
  encounterId: string,
  eventId: string
): void {
  coreAddEventToEncounter(encounterId, eventId);
  trace("encounter", "addEventToEncounter", encounterId, { eventId });
}

export function createEpisode(patientId: string, title: string): Episode {
  const episode = coreCreateEpisode(patientId, title);
  trace("episode", "createEpisode", episode.id, { patientId, title });
  return episode;
}

export function addEncounterToEpisode(
  episodeId: string,
  encounterId: string
): void {
  coreAddEncounterToEpisode(episodeId, encounterId);
  trace("episode", "addEncounterToEpisode", episodeId, { encounterId });
}

export function getPatientClinicalGraph(
  patientId: string
): PatientClinicalGraph {
  trace("query", "getPatientClinicalGraph", patientId);
  return coreGetPatientClinicalGraph(patientId);
}

export function getEpisodeClinicalGraph(
  episodeId: string
): EpisodeClinicalGraph {
  trace("query", "getEpisodeClinicalGraph", episodeId);
  return coreGetEpisodeClinicalGraph(episodeId);
}

export function getPatientUnifiedTimeline(
  patientId: string
): UnifiedTimelineEntry[] {
  trace("query", "getPatientUnifiedTimeline", patientId);
  return coreGetPatientUnifiedTimeline(patientId);
}

export function getPatientSummary(patientId: string): PatientSummary {
  trace("reasoning", "getPatientSummary", patientId);
  return coreGetPatientSummary(patientId);
}

export function getEpisodeInsights(episodeId: string): EpisodeInsights {
  trace("reasoning", "getEpisodeInsights", episodeId);
  return coreGetEpisodeInsights(episodeId);
}

export function getPatientActivityProfile(
  patientId: string
): PatientActivityProfile {
  trace("reasoning", "getPatientActivityProfile", patientId);
  return coreGetPatientActivityProfile(patientId);
}
