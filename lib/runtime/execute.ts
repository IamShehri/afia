import {
  evaluateControl,
  addEncounterToEpisode,
  addEventToEncounter,
  appendEvent,
  createEncounter,
  createEpisode,
  createObservationEvent,
  createPatient,
  getEpisodeClinicalGraph,
  getEpisodeInsights,
  getPatientActivityProfile,
  getPatientClinicalGraph,
  getPatientSummary,
  getPatientUnifiedTimeline,
  toTimelineClinicalEvent,
} from "../control/index";
import type { ControlDecision } from "../control/types";
import { getTrace, recordTrace } from "../observability/index";
import type {
  RuntimeContext,
  RuntimeExecutionResult,
  RuntimeReplaySummary,
  SafeRuntimeResult,
} from "./types";
import { getExecutionRecord, storeExecutionRecord } from "./store";

function resolveTraceId(context: RuntimeContext): string {
  if (context.metadata?.traceId) {
    return String(context.metadata.traceId);
  }
  return `rt_${context.timestamp}_${context.requestType}_${context.patientId}`;
}

function resolveControlLayer(context: RuntimeContext): string {
  if (context.requestType === "patient_flow") {
    return "patient";
  }
  if (context.requestType === "query") {
    return "query";
  }
  if (context.requestType === "reasoning") {
    return "reasoning";
  }
  return context.metadata?.layer ?? "event";
}

function recordRuntimeTrace(
  traceId: string,
  action: string,
  context: RuntimeContext,
  extra?: Record<string, any>
): void {
  const meta: Record<string, any> = {
    traceId,
    patientId: context.patientId,
    requestType: context.requestType,
    phase: "runtime",
  };

  if (extra) {
    for (const key of Object.keys(extra)) {
      meta[key] = extra[key];
    }
  }

  recordTrace({
    timestamp: context.timestamp,
    layer: "query",
    action,
    entityId: traceId,
    meta,
  });
}

function patientExists(patientId: string): boolean {
  try {
    getPatientClinicalGraph(patientId);
    return true;
  } catch {
    return false;
  }
}

function runPatientFlow(
  context: RuntimeContext,
  patientId: string
): Record<string, any> {
  let effectivePatientId = patientId;

  if (!patientExists(effectivePatientId)) {
    const patientName =
      typeof context.metadata?.patientName === "string"
        ? context.metadata.patientName
        : "Runtime Patient";
    const patient = createPatient({ name: patientName });
    effectivePatientId = patient.id;
  }

  const episodeTitle =
    typeof context.metadata?.episodeTitle === "string"
      ? context.metadata.episodeTitle
      : "Runtime Episode";
  const episode = createEpisode(effectivePatientId, episodeTitle);
  const encounter = createEncounter(effectivePatientId);

  addEncounterToEpisode(episode.id, encounter.id);

  const event = createObservationEvent({
    patientId: effectivePatientId,
    payload: { source: "runtime.patient_flow" },
  });

  addEventToEncounter(encounter.id, event.id);
  appendEvent(effectivePatientId, toTimelineClinicalEvent(event));

  return {
    patientId: effectivePatientId,
    episodeId: episode.id,
    encounterId: encounter.id,
    eventId: event.id,
  };
}

function runMutation(context: RuntimeContext, patientId: string): Record<string, any> {
  const action = context.metadata?.action;

  if (action === "createEpisode") {
    const title =
      typeof context.metadata?.episodeTitle === "string"
        ? context.metadata.episodeTitle
        : "Runtime Mutation Episode";
    const episode = createEpisode(patientId, title);
    return { episodeId: episode.id };
  }

  if (action === "createEncounter") {
    const encounter = createEncounter(patientId);
    return { encounterId: encounter.id };
  }

  if (action === "appendObservation") {
    const event = createObservationEvent({
      patientId,
      payload: { source: "runtime.mutation" },
    });
    appendEvent(patientId, toTimelineClinicalEvent(event));
    return { eventId: event.id };
  }

  throw new Error(`Unsupported mutation action: ${String(action)}`);
}

function runQueryLayer(
  context: RuntimeContext,
  patientId: string
): Record<string, any> {
  const outputs: Record<string, any> = {
    graph: getPatientClinicalGraph(patientId),
    timeline: getPatientUnifiedTimeline(patientId),
  };

  if (context.episodeId) {
    outputs.episodeGraph = getEpisodeClinicalGraph(context.episodeId);
  }

  return outputs;
}

function runReasoningLayer(
  context: RuntimeContext,
  patientId: string
): Record<string, any> {
  const outputs: Record<string, any> = {
    summary: getPatientSummary(patientId),
    activityProfile: getPatientActivityProfile(patientId),
  };

  if (context.episodeId) {
    outputs.episodeInsights = getEpisodeInsights(context.episodeId);
  }

  return outputs;
}

export function executeClinicalRuntime(
  context: RuntimeContext
): RuntimeExecutionResult {
  const traceId = resolveTraceId(context);
  const controlLayer = resolveControlLayer(context);
  const controlDecisions: ControlDecision[] = [];

  const decision = evaluateControl(controlLayer, {
    action: "executeClinicalRuntime",
    context,
  });
  controlDecisions.push(decision);

  if (!decision.allowed) {
    throw new Error(
      `Runtime blocked by control layer: ${decision.triggeredRules.join(", ")}`
    );
  }

  recordRuntimeTrace(traceId, "runtime.start", context);

  let effectiveContext = context;
  if (decision.modifiedContext?.context) {
    effectiveContext = decision.modifiedContext.context as RuntimeContext;
  }

  let patientId = effectiveContext.patientId;
  let domain: Record<string, any> | undefined;
  let query: Record<string, any> | undefined;
  let reasoning: Record<string, any> | undefined;

  if (effectiveContext.requestType === "patient_flow") {
    domain = runPatientFlow(effectiveContext, patientId);
    patientId = String(domain.patientId);
  } else if (effectiveContext.requestType === "mutation") {
    domain = runMutation(effectiveContext, patientId);
  }

  query = runQueryLayer(effectiveContext, patientId);
  reasoning = runReasoningLayer(effectiveContext, patientId);

  const result: RuntimeExecutionResult = {
    traceId,
    requestType: effectiveContext.requestType,
    patientId,
    domain,
    query,
    reasoning,
  };

  recordRuntimeTrace(traceId, "runtime.complete", effectiveContext, {
    hasDomain: domain !== undefined,
    timelineCount: Array.isArray(query.timeline) ? query.timeline.length : 0,
  });

  const replaySummary: RuntimeReplaySummary = {
    traceId,
    controlDecisions: controlDecisions.map((entry) => ({
      layer: controlLayer,
      allowed: entry.allowed,
      triggeredRules: entry.triggeredRules.slice(),
    })),
    queryOutputs: {
      timelineCount: Array.isArray(query.timeline) ? query.timeline.length : 0,
      episodeGraphIncluded: query.episodeGraph !== undefined,
    },
    reasoningOutputs: {
      totalEvents: reasoning.summary?.totalEvents ?? 0,
      episodeInsightsIncluded: reasoning.episodeInsights !== undefined,
    },
    traces: getTrace()
      .filter((trace) => trace.meta?.traceId === traceId)
      .map((trace) => ({
        timestamp: trace.timestamp,
        layer: trace.layer,
        action: trace.action,
        entityId: trace.entityId,
      })),
  };

  storeExecutionRecord(traceId, replaySummary);

  return result;
}

export function safeExecuteRuntime(context: RuntimeContext): SafeRuntimeResult {
  const traceId = resolveTraceId(context);

  try {
    const result = executeClinicalRuntime(context);
    return { result };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    recordRuntimeTrace(traceId, "runtime.failure", context, {
      error: message,
    });

    return { error: message };
  }
}

export function replayRuntimeExecution(traceId: string): RuntimeReplaySummary {
  const stored = getExecutionRecord(traceId);
  if (stored !== null) {
    return stored;
  }

  const traces = getTrace()
    .filter((trace) => trace.meta?.traceId === traceId)
    .map((trace) => ({
      timestamp: trace.timestamp,
      layer: trace.layer,
      action: trace.action,
      entityId: trace.entityId,
    }));

  return {
    traceId,
    controlDecisions: [],
    queryOutputs: {},
    reasoningOutputs: {},
    traces,
  };
}
