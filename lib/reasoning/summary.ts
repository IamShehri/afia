import {
  getPatientClinicalGraph,
  getPatientUnifiedTimeline,
} from "../query/index";
import type { PatientSummary } from "./types";
import {
  countActiveEncounters,
  countEncountersInGraph,
} from "./helpers";

export function getPatientSummary(patientId: string): PatientSummary {
  const graph = getPatientClinicalGraph(patientId);
  const timeline = getPatientUnifiedTimeline(patientId);

  let activeEpisodes = 0;
  for (const episodeNode of graph.episodes) {
    if (episodeNode.episode.status === "active") {
      activeEpisodes++;
    }
  }

  const mostRecentEvent =
    timeline.length > 0 ? timeline[timeline.length - 1] : null;

  let timelineStart = 0;
  let timelineEnd = 0;
  if (timeline.length > 0) {
    timelineStart = timeline[0].timestamp;
    timelineEnd = timeline[timeline.length - 1].timestamp;
  }

  return {
    patientId: graph.patient.id,
    totalEpisodes: graph.episodes.length,
    totalEncounters: countEncountersInGraph(graph),
    totalEvents: timeline.length,
    activeEpisodes,
    activeEncounters: countActiveEncounters(graph),
    mostRecentEvent,
    timelineSpan: {
      start: timelineStart,
      end: timelineEnd,
    },
  };
}
