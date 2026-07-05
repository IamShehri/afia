import { getPatientEncounters } from "../encounter/index";
import { getPatientEpisodes } from "../episode/index";
import { getPatientTimeline } from "../clinical-timeline/index";
import type { ClinicalEvent } from "../clinical-timeline/types";
import type { Encounter } from "../encounter/types";

export function buildEventEncounterMap(patientId: string): Map<string, string> {
  const map = new Map<string, string>();
  const encounters = getPatientEncounters(patientId);

  for (const encounter of encounters) {
    for (const eventId of encounter.eventIds) {
      map.set(eventId, encounter.id);
    }
  }

  return map;
}

export function buildEncounterEpisodeMap(patientId: string): Map<string, string> {
  const map = new Map<string, string>();
  const episodes = getPatientEpisodes(patientId);

  for (const episode of episodes) {
    for (const encounterId of episode.encounterIds) {
      map.set(encounterId, episode.id);
    }
  }

  return map;
}

export function getEventsForEncounter(
  encounter: Encounter,
  timeline: ClinicalEvent[]
): ClinicalEvent[] {
  const events: ClinicalEvent[] = [];

  for (const event of timeline) {
    if (encounter.eventIds.includes(event.id)) {
      events.push(event);
    }
  }

  return events.sort((a, b) => a.timestamp - b.timestamp);
}

export function getPatientTimelineSnapshot(patientId: string): ClinicalEvent[] {
  return getPatientTimeline(patientId).slice();
}
