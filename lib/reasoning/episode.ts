import { getEpisodeClinicalGraph } from "../query/index";
import type { EpisodeInsights } from "./types";
import { countEventTypes, resolveEpisodeDuration } from "./helpers";

export function getEpisodeInsights(episodeId: string): EpisodeInsights {
  const graph = getEpisodeClinicalGraph(episodeId);
  const encounterFrequency = graph.encounters.length;
  const totalEvents = graph.eventsFlattened.length;

  let mostActiveEncounter: EpisodeInsights["mostActiveEncounter"] = null;
  let highestEventCount = -1;

  for (const encounterNode of graph.encounters) {
    const eventCount = encounterNode.events.length;
    if (eventCount > highestEventCount) {
      highestEventCount = eventCount;
      mostActiveEncounter = {
        encounterId: encounterNode.encounter.id,
        eventCount,
      };
    }
  }

  const eventDensity =
    encounterFrequency > 0 ? totalEvents / encounterFrequency : 0;

  return {
    episodeId: graph.episode.id,
    eventTypeDistribution: countEventTypes(graph.eventsFlattened),
    encounterFrequency,
    episodeDuration: resolveEpisodeDuration(
      graph.episode.startedAt,
      graph.episode.endedAt
    ),
    mostActiveEncounter,
    eventDensity,
  };
}
