import { getEncounter } from "../encounter/index";
import { getEpisode, getPatientEpisodes } from "../episode/index";
import { getPatient } from "../patient/index";
import type {
  EpisodeClinicalGraph,
  EpisodeClinicalNode,
  PatientClinicalGraph,
  UnifiedTimelineEntry,
} from "./types";
import {
  buildEncounterEpisodeMap,
  buildEventEncounterMap,
  getEventsForEncounter,
  getPatientTimelineSnapshot,
} from "./helpers";

export function getPatientClinicalGraph(patientId: string): PatientClinicalGraph {
  const patient = getPatient(patientId);
  if (patient === null) {
    throw new Error("Patient does not exist");
  }

  const timeline = getPatientTimelineSnapshot(patientId);
  const episodes = getPatientEpisodes(patientId);
  const episodeNodes: EpisodeClinicalNode[] = [];

  for (const episode of episodes) {
    const encounterNodes = [];

    for (const encounterId of episode.encounterIds) {
      const encounter = getEncounter(encounterId);
      if (encounter === null) {
        continue;
      }

      encounterNodes.push({
        encounter,
        events: getEventsForEncounter(encounter, timeline),
      });
    }

    episodeNodes.push({
      episode,
      encounters: encounterNodes,
    });
  }

  return {
    patient,
    episodes: episodeNodes,
  };
}

export function getEpisodeClinicalGraph(episodeId: string): EpisodeClinicalGraph {
  const episode = getEpisode(episodeId);
  if (episode === null) {
    throw new Error("Episode does not exist");
  }

  const timeline = getPatientTimelineSnapshot(episode.patientId);
  const encounters: EpisodeClinicalNode["encounters"] = [];
  const eventsFlattened = [];

  for (const encounterId of episode.encounterIds) {
    const encounter = getEncounter(encounterId);
    if (encounter === null) {
      continue;
    }

    const events = getEventsForEncounter(encounter, timeline);
    encounters.push({ encounter, events });

    for (const event of events) {
      eventsFlattened.push(event);
    }
  }

  eventsFlattened.sort((a, b) => a.timestamp - b.timestamp);

  return {
    episode,
    encounters,
    eventsFlattened,
  };
}

export function getPatientUnifiedTimeline(patientId: string): UnifiedTimelineEntry[] {
  const patient = getPatient(patientId);
  if (patient === null) {
    throw new Error("Patient does not exist");
  }

  const timeline = getPatientTimelineSnapshot(patientId);
  const eventEncounterMap = buildEventEncounterMap(patientId);
  const encounterEpisodeMap = buildEncounterEpisodeMap(patientId);
  const entries: UnifiedTimelineEntry[] = [];

  for (const event of timeline) {
    const encounterId = eventEncounterMap.get(event.id) ?? null;
    const episodeId =
      encounterId !== null ? (encounterEpisodeMap.get(encounterId) ?? null) : null;

    entries.push({
      id: event.id,
      patientId: event.patientId,
      timestamp: event.timestamp,
      eventType: event.eventType,
      payload: event.payload,
      encounterId,
      episodeId,
    });
  }

  return entries.sort((a, b) => a.timestamp - b.timestamp);
}
