import type { SystemBlueprint } from "./types";

const BLUEPRINT_VERSION = "1.0.0";

export function generateSystemBlueprint(): SystemBlueprint {
  return {
    version: BLUEPRINT_VERSION,
    layers: [
      "control",
      "observability",
      "domain",
      "query",
      "reasoning",
      "fault-validation",
    ],
    modules: {
      "domain.patient": "lib/patient",
      "domain.episode": "lib/episode",
      "domain.encounter": "lib/encounter",
      "domain.event": "lib/clinical-events",
      "domain.timeline": "lib/clinical-timeline",
      "domain.registry": "lib/clinical-registry",
      "query": "lib/query",
      "reasoning": "lib/reasoning",
      "observability": "lib/observability",
      "control": "lib/control",
      "fault-validation": "scripts/fault-injection",
      "production": "lib/production",
    },
    executionFlow: [
      "control.evaluate",
      "observability.record",
      "domain.patient.create",
      "domain.episode.create",
      "domain.encounter.create",
      "domain.event.create",
      "domain.timeline.append",
      "domain.encounter.attach-event",
      "domain.episode.attach-encounter",
      "query.getPatientClinicalGraph",
      "query.getEpisodeClinicalGraph",
      "query.getPatientUnifiedTimeline",
      "reasoning.getPatientSummary",
      "reasoning.getEpisodeInsights",
      "reasoning.getPatientActivityProfile",
    ],
    dataFlow: [
      "patient.id -> episode.patientId",
      "patient.id -> encounter.patientId",
      "patient.id -> event.patientId",
      "patient.id -> timeline.patientId",
      "event.id -> encounter.eventIds",
      "encounter.id -> episode.encounterIds",
      "domain.timeline -> query.unifiedTimeline",
      "query.graph -> reasoning.summary",
      "query.graph -> reasoning.insights",
      "query.graph -> reasoning.activityProfile",
    ],
    controlFlow: [
      "control.registerRule",
      "control.evaluateControl",
      "control.intercepted -> domain",
      "control.intercepted -> query",
      "control.intercepted -> reasoning",
      "control.block -> halt execution",
      "control.augment -> modified context downstream",
    ],
  };
}
