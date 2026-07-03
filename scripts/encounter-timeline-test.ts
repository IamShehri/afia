import { createPatient, getPatient } from "../lib/patient/index";
import {
  createEncounter,
  getEncounter,
  getPatientEncounters,
  addEventToEncounter,
} from "../lib/encounter/index";
import {
  createDiagnosisEvent,
  createLabResultEvent,
  createMedicationEvent,
  createObservationEvent,
} from "../lib/clinical-events/factories";
import { toTimelineClinicalEvent } from "../lib/clinical-events/adapter";
import { appendEvent, getPatientTimeline } from "../lib/clinical-timeline/index";
import type { ClinicalEventType } from "../lib/clinical-events/types";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertTimelineSorted(timeline: { timestamp: number }[]): void {
  for (let i = 1; i < timeline.length; i++) {
    assert(
      timeline[i - 1].timestamp <= timeline[i].timestamp,
      `Timeline not sorted ascending at index ${i}`
    );
  }
}

function assertNoOverlap(a: string[], b: string[]): void {
  const overlap = a.filter((id) => b.includes(id));
  assert(
    overlap.length === 0,
    `Events duplicated across encounters: ${overlap.join(", ")}`
  );
}

function main(): void {
  const patient = createPatient({ name: "Encounter Timeline Test Patient" });
  const patientId = patient.id;

  assert(!!patientId && typeof patientId === "string", "Patient must have valid id");
  assert(getPatient(patientId) !== null, "Patient must exist in store");

  const encounterA = createEncounter(patientId);
  const encounterB = createEncounter(patientId);

  const encounters = getPatientEncounters(patientId);
  assert(encounters.length === 2, `Expected 2 encounters, got ${encounters.length}`);

  const encounterAEvents = [
    createObservationEvent({ patientId, payload: { value: 98.6 } }),
    createDiagnosisEvent({ patientId, payload: { code: "J06.9" } }),
  ];

  const encounterBEvents = [
    createMedicationEvent({ patientId, payload: { name: "Ibuprofen" } }),
    createLabResultEvent({ patientId, payload: { test: "CBC", result: "normal" } }),
  ];

  const expectedTypes: ClinicalEventType[] = [
    "observation",
    "diagnosis",
    "medication",
    "lab_result",
  ];

  for (const event of encounterAEvents) {
    addEventToEncounter(encounterA.id, event.id);
    const timelineEvent = toTimelineClinicalEvent(event);
    assert(
      timelineEvent.eventType === event.type,
      `type → eventType mapping failed for ${event.type}`
    );
    appendEvent(patientId, timelineEvent);
  }

  for (const event of encounterBEvents) {
    addEventToEncounter(encounterB.id, event.id);
    const timelineEvent = toTimelineClinicalEvent(event);
    assert(
      timelineEvent.eventType === event.type,
      `type → eventType mapping failed for ${event.type}`
    );
    appendEvent(patientId, timelineEvent);
  }

  const allSemanticEvents = encounterAEvents.concat(encounterBEvents);

  const updatedEncounterA = getEncounter(encounterA.id);
  const updatedEncounterB = getEncounter(encounterB.id);

  assert(updatedEncounterA !== null, "Encounter A must exist");
  assert(updatedEncounterB !== null, "Encounter B must exist");
  assert(
    updatedEncounterA.eventIds.length === 2,
    `Encounter A must contain exactly 2 events, got ${updatedEncounterA.eventIds.length}`
  );
  assert(
    updatedEncounterB.eventIds.length === 2,
    `Encounter B must contain exactly 2 events, got ${updatedEncounterB.eventIds.length}`
  );
  assertNoOverlap(updatedEncounterA.eventIds, updatedEncounterB.eventIds);

  const timeline = getPatientTimeline(patientId);

  assert(timeline.length === 4, `Expected 4 timeline events, got ${timeline.length}`);

  for (const event of allSemanticEvents) {
    const found = timeline.find((entry) => entry.id === event.id);
    assert(found !== undefined, `Event ${event.id} missing from timeline`);
    assert(
      found.eventType === event.type,
      `Event type not preserved for ${event.id}: expected ${event.type}, got ${found.eventType}`
    );
    assert(
      expectedTypes.includes(found.eventType as ClinicalEventType),
      `Invalid clinical event type: ${found.eventType}`
    );
  }

  assertTimelineSorted(timeline);

  console.log("AFIA ENCOUNTER TIMELINE INTEGRATION PASSED");
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
