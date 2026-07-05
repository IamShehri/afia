import { getEncounter } from "../encounter/index";
import { getPatient } from "../patient/index";
import type { Episode } from "./types";

const episodes = new Map<string, Episode>();

function createId(): string {
  return `epi_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createEpisode(patientId: string, title: string): Episode {
  if (getPatient(patientId) === null) {
    throw new Error("Patient does not exist");
  }

  const episode: Episode = {
    id: createId(),
    patientId,
    title,
    startedAt: Date.now(),
    endedAt: null,
    status: "active",
    encounterIds: [],
  };
  episodes.set(episode.id, episode);
  return episode;
}

export function addEncounterToEpisode(episodeId: string, encounterId: string): void {
  const episode = episodes.get(episodeId);
  if (!episode) {
    throw new Error("Episode does not exist");
  }
  if (episode.status !== "active") {
    throw new Error("Episode is not active");
  }
  if (episode.encounterIds.includes(encounterId)) {
    return;
  }

  const encounter = getEncounter(encounterId);
  if (encounter === null) {
    throw new Error("Encounter does not exist");
  }
  if (encounter.patientId !== episode.patientId) {
    throw new Error("Encounter patientId must match episode patientId");
  }

  episode.encounterIds.push(encounterId);
  episodes.set(episodeId, episode);
}

export function closeEpisode(episodeId: string): Episode {
  const episode = episodes.get(episodeId);
  if (!episode) {
    throw new Error("Episode does not exist");
  }

  const closed: Episode = {
    id: episode.id,
    patientId: episode.patientId,
    title: episode.title,
    startedAt: episode.startedAt,
    endedAt: Date.now(),
    status: "closed",
    encounterIds: episode.encounterIds.slice(),
  };
  episodes.set(episodeId, closed);
  return closed;
}

export function getEpisode(episodeId: string): Episode | null {
  return episodes.get(episodeId) ?? null;
}

export function getPatientEpisodes(patientId: string): Episode[] {
  const results: Episode[] = [];

  for (const episode of episodes.values()) {
    if (episode.patientId === patientId) {
      results.push(episode);
    }
  }

  return results.sort((a, b) => a.startedAt - b.startedAt);
}
