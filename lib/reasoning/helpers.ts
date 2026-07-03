import type { PatientClinicalGraph } from "../query/types";

export function countEventTypes(
  events: Array<{ eventType: string }>
): Record<string, number> {
  const distribution: Record<string, number> = {};

  for (const event of events) {
    const current = distribution[event.eventType] ?? 0;
    distribution[event.eventType] = current + 1;
  }

  return distribution;
}

export function countEncountersInGraph(graph: PatientClinicalGraph): number {
  let total = 0;

  for (const episodeNode of graph.episodes) {
    total += episodeNode.encounters.length;
  }

  return total;
}

export function countActiveEncounters(graph: PatientClinicalGraph): number {
  let total = 0;

  for (const episodeNode of graph.episodes) {
    for (const encounterNode of episodeNode.encounters) {
      if (encounterNode.encounter.status === "active") {
        total++;
      }
    }
  }

  return total;
}

export function resolveEpisodeDuration(
  startedAt: number,
  endedAt: number | null | undefined
): number {
  const end = endedAt ?? Date.now();
  return end - startedAt;
}
