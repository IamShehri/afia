import { getPatient } from "../patient/index";
import type { Encounter } from "./types";

const encounters = new Map<string, Encounter>();

function createId(): string {
  return `enc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createEncounter(patientId: string): Encounter {
  if (getPatient(patientId) === null) {
    throw new Error("Patient does not exist");
  }

  const encounter: Encounter = {
    id: createId(),
    patientId,
    startedAt: Date.now(),
    endedAt: null,
    status: "active",
    eventIds: [],
  };
  encounters.set(encounter.id, encounter);
  return encounter;
}

export function addEventToEncounter(encounterId: string, eventId: string): void {
  const encounter = encounters.get(encounterId);
  if (!encounter) {
    throw new Error("Encounter does not exist");
  }
  if (encounter.status !== "active") {
    throw new Error("Encounter is not active");
  }
  if (encounter.eventIds.includes(eventId)) {
    return;
  }

  encounter.eventIds.push(eventId);
  encounters.set(encounterId, encounter);
}

export function closeEncounter(encounterId: string): Encounter {
  const encounter = encounters.get(encounterId);
  if (!encounter) {
    throw new Error("Encounter does not exist");
  }

  const closed: Encounter = {
    id: encounter.id,
    patientId: encounter.patientId,
    startedAt: encounter.startedAt,
    endedAt: Date.now(),
    status: "closed",
    eventIds: encounter.eventIds.slice(),
  };
  encounters.set(encounterId, closed);
  return closed;
}

export function getEncounter(encounterId: string): Encounter | null {
  return encounters.get(encounterId) ?? null;
}

export function getPatientEncounters(patientId: string): Encounter[] {
  const results: Encounter[] = [];

  for (const encounter of encounters.values()) {
    if (encounter.patientId === patientId) {
      results.push(encounter);
    }
  }

  return results.sort((a, b) => a.startedAt - b.startedAt);
}
