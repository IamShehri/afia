import type { ExecutionTopology } from "./types";

export function getExecutionTopology(): ExecutionTopology {
  return {
    entry: "control.intercepted.request",
    flow: [
      {
        step: 1,
        layer: "control",
        component: "lib/control",
        action: "evaluateControl",
        intercepts: ["patient", "event", "encounter", "episode", "query", "reasoning"],
      },
      {
        step: 2,
        layer: "observability",
        component: "lib/observability",
        action: "recordTrace",
        observes: ["patient", "event", "encounter", "episode", "query", "reasoning"],
      },
      {
        step: 3,
        layer: "domain",
        component: "lib/patient",
        action: "createPatient",
      },
      {
        step: 4,
        layer: "domain",
        component: "lib/episode",
        action: "createEpisode",
      },
      {
        step: 5,
        layer: "domain",
        component: "lib/encounter",
        action: "createEncounter",
      },
      {
        step: 6,
        layer: "domain",
        component: "lib/clinical-events",
        action: "createTypedEvent",
      },
      {
        step: 7,
        layer: "domain",
        component: "lib/clinical-timeline",
        action: "appendEvent",
      },
      {
        step: 8,
        layer: "domain",
        component: "lib/encounter",
        action: "addEventToEncounter",
      },
      {
        step: 9,
        layer: "domain",
        component: "lib/episode",
        action: "addEncounterToEpisode",
      },
      {
        step: 10,
        layer: "query",
        component: "lib/query",
        action: "getPatientClinicalGraph",
      },
      {
        step: 11,
        layer: "query",
        component: "lib/query",
        action: "getPatientUnifiedTimeline",
      },
      {
        step: 12,
        layer: "reasoning",
        component: "lib/reasoning",
        action: "getPatientSummary",
      },
      {
        step: 13,
        layer: "reasoning",
        component: "lib/reasoning",
        action: "getEpisodeInsights",
      },
      {
        step: 14,
        layer: "reasoning",
        component: "lib/reasoning",
        action: "getPatientActivityProfile",
      },
      {
        step: 15,
        layer: "fault-validation",
        component: "scripts/fault-injection",
        action: "verifyResilience",
      },
    ],
    exit: "reasoning.output",
  };
}
