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
import { evaluateControl } from "./evaluate";
import type { ControlLayer } from "./types";

function assertAllowed(
  layer: ControlLayer,
  action: string,
  decision: ReturnType<typeof evaluateControl>
): void {
  if (!decision.allowed) {
    throw new Error(
      `Control layer blocked ${layer}.${action} via rules: ${decision.triggeredRules.join(", ")}`
    );
  }
}

function runControlled<T>(
  layer: ControlLayer,
  action: string,
  context: any,
  execute: (effectiveContext: any) => T
): T {
  const decision = evaluateControl(layer, context);
  assertAllowed(layer, action, decision);
  const effectiveContext = decision.modifiedContext ?? context;
  return execute(effectiveContext);
}

export function createPatient(input: CreatePatientInput): Patient {
  return runControlled("patient", "createPatient", { action: "createPatient", input }, (ctx) =>
    coreCreatePatient(ctx.input as CreatePatientInput)
  );
}

function createSemanticEvent(
  action: string,
  input: CreateClinicalEventFactoryInput,
  factory: (input: CreateClinicalEventFactoryInput) => SemanticClinicalEvent
): SemanticClinicalEvent {
  return runControlled("event", action, { action, input }, (ctx) =>
    factory(ctx.input as CreateClinicalEventFactoryInput)
  );
}

export function createObservationEvent(
  input: CreateClinicalEventFactoryInput
): SemanticClinicalEvent {
  return createSemanticEvent("createObservationEvent", input, coreCreateObservationEvent);
}

export function createDiagnosisEvent(
  input: CreateClinicalEventFactoryInput
): SemanticClinicalEvent {
  return createSemanticEvent("createDiagnosisEvent", input, coreCreateDiagnosisEvent);
}

export function createMedicationEvent(
  input: CreateClinicalEventFactoryInput
): SemanticClinicalEvent {
  return createSemanticEvent("createMedicationEvent", input, coreCreateMedicationEvent);
}

export function createProcedureEvent(
  input: CreateClinicalEventFactoryInput
): SemanticClinicalEvent {
  return createSemanticEvent("createProcedureEvent", input, coreCreateProcedureEvent);
}

export function createEncounterEvent(
  input: CreateClinicalEventFactoryInput
): SemanticClinicalEvent {
  return createSemanticEvent("createEncounterEvent", input, coreCreateEncounterEvent);
}

export function createLabResultEvent(
  input: CreateClinicalEventFactoryInput
): SemanticClinicalEvent {
  return createSemanticEvent("createLabResultEvent", input, coreCreateLabResultEvent);
}

export function toTimelineClinicalEvent(
  event: SemanticClinicalEvent
): TimelineClinicalEvent {
  return runControlled(
    "event",
    "toTimelineClinicalEvent",
    { action: "toTimelineClinicalEvent", event },
    (ctx) => coreToTimelineClinicalEvent(ctx.event as SemanticClinicalEvent)
  );
}

export function createClinicalEvent(
  input: CreateClinicalEventInput
): TimelineClinicalEvent {
  return runControlled("event", "createClinicalEvent", { action: "createClinicalEvent", input }, (ctx) =>
    coreCreateClinicalEvent(ctx.input as CreateClinicalEventInput)
  );
}

export function appendEvent(
  patientId: string,
  event: TimelineClinicalEvent
): void {
  runControlled(
    "event",
    "appendEvent",
    { action: "appendEvent", patientId, event },
    (ctx) => {
      coreAppendEvent(ctx.patientId as string, ctx.event as TimelineClinicalEvent);
    }
  );
}

export function createEncounter(patientId: string): Encounter {
  return runControlled(
    "encounter",
    "createEncounter",
    { action: "createEncounter", patientId },
    (ctx) => coreCreateEncounter(ctx.patientId as string)
  );
}

export function addEventToEncounter(
  encounterId: string,
  eventId: string
): void {
  runControlled(
    "encounter",
    "addEventToEncounter",
    { action: "addEventToEncounter", encounterId, eventId },
    (ctx) => {
      coreAddEventToEncounter(ctx.encounterId as string, ctx.eventId as string);
    }
  );
}

export function createEpisode(patientId: string, title: string): Episode {
  return runControlled(
    "episode",
    "createEpisode",
    { action: "createEpisode", patientId, title },
    (ctx) => coreCreateEpisode(ctx.patientId as string, ctx.title as string)
  );
}

export function addEncounterToEpisode(
  episodeId: string,
  encounterId: string
): void {
  runControlled(
    "episode",
    "addEncounterToEpisode",
    { action: "addEncounterToEpisode", episodeId, encounterId },
    (ctx) => {
      coreAddEncounterToEpisode(ctx.episodeId as string, ctx.encounterId as string);
    }
  );
}

export function getPatientClinicalGraph(
  patientId: string
): PatientClinicalGraph {
  return runControlled(
    "query",
    "getPatientClinicalGraph",
    { action: "getPatientClinicalGraph", patientId },
    (ctx) => coreGetPatientClinicalGraph(ctx.patientId as string)
  );
}

export function getEpisodeClinicalGraph(
  episodeId: string
): EpisodeClinicalGraph {
  return runControlled(
    "query",
    "getEpisodeClinicalGraph",
    { action: "getEpisodeClinicalGraph", episodeId },
    (ctx) => coreGetEpisodeClinicalGraph(ctx.episodeId as string)
  );
}

export function getPatientUnifiedTimeline(
  patientId: string
): UnifiedTimelineEntry[] {
  return runControlled(
    "query",
    "getPatientUnifiedTimeline",
    { action: "getPatientUnifiedTimeline", patientId },
    (ctx) => coreGetPatientUnifiedTimeline(ctx.patientId as string)
  );
}

export function getPatientSummary(patientId: string): PatientSummary {
  return runControlled(
    "reasoning",
    "getPatientSummary",
    { action: "getPatientSummary", patientId },
    (ctx) => coreGetPatientSummary(ctx.patientId as string)
  );
}

export function getEpisodeInsights(episodeId: string): EpisodeInsights {
  return runControlled(
    "reasoning",
    "getEpisodeInsights",
    { action: "getEpisodeInsights", episodeId },
    (ctx) => coreGetEpisodeInsights(ctx.episodeId as string)
  );
}

export function getPatientActivityProfile(
  patientId: string
): PatientActivityProfile {
  return runControlled(
    "reasoning",
    "getPatientActivityProfile",
    { action: "getPatientActivityProfile", patientId },
    (ctx) => coreGetPatientActivityProfile(ctx.patientId as string)
  );
}
