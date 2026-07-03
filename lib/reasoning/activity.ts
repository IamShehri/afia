import {
  getPatientClinicalGraph,
  getPatientUnifiedTimeline,
} from "../query/index";
import type { ActivityHotspot, PatientActivityProfile } from "./types";
import { countEventTypes } from "./helpers";

function buildActivityHotspots(
  graph: ReturnType<typeof getPatientClinicalGraph>
): ActivityHotspot[] {
  const hotspots: ActivityHotspot[] = [];

  for (const episodeNode of graph.episodes) {
    for (const encounterNode of episodeNode.encounters) {
      hotspots.push({
        encounterId: encounterNode.encounter.id,
        episodeId: episodeNode.episode.id,
        eventCount: encounterNode.events.length,
      });
    }
  }

  return hotspots.sort((a, b) => b.eventCount - a.eventCount);
}

export function getPatientActivityProfile(
  patientId: string
): PatientActivityProfile {
  const graph = getPatientClinicalGraph(patientId);
  const timeline = getPatientUnifiedTimeline(patientId);

  const encounterFrequencyPerEpisode = graph.episodes.map((episodeNode) => ({
    episodeId: episodeNode.episode.id,
    encounterCount: episodeNode.encounters.length,
  }));

  return {
    patientId: graph.patient.id,
    eventTypeBreakdown: countEventTypes(timeline),
    encounterFrequencyPerEpisode,
    activityHotspots: buildActivityHotspots(graph),
  };
}
