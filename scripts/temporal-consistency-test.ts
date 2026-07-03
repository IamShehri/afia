import { createPatient, getPatient } from "../lib/patient/index";
import {
  addEventToEncounter,
  createEncounter,
  getEncounter,
  getPatientEncounters,
} from "../lib/encounter/index";
import {
  createDiagnosisEvent,
  createLabResultEvent,
  createMedicationEvent,
  createObservationEvent,
  createProcedureEvent,
} from "../lib/clinical-events/factories";
import { toTimelineClinicalEvent } from "../lib/clinical-events/adapter";
import { appendEvent, getPatientTimeline } from "../lib/clinical-timeline/index";
import type { ClinicalEvent } from "../lib/clinical-events/types";
import type { ClinicalEventType } from "../lib/clinical-events/types";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assertTimelineSorted(timeline: { timestamp: number }[]): void {
  for (let i = 1; i < timeline.length; i++) {
    assert(
      timeline[i - 1].timestamp <= timeline[i].timestamp,
      `Timeline not sorted ascending at index ${i}`
    );
  }
}

function assertStrictTemporalOrder(events: ClinicalEvent[]): void {
  for (let i = 1; i < events.length; i++) {
    assert(
      events[i - 1].timestamp < events[i].timestamp,
      `Event timestamps not strictly increasing at index ${i}`
    );
  }
}

async function main(): Promise<void> {
  const patient = createPatient({ name: "Temporal Consistency Test Patient" });
  const patientId = patient.id;

  assert(!!patientId && typeof patientId === "string", "Patient must have valid id");
  assert(getPatient(patientId) !== null, "Patient must exist in store");

  const encounterA = createEncounter(patientId);
  const encounterB = createEncounter(patientId);

  assert(
    getPatientEncounters(patientId).length === 2,
    "Expected exactly 2 encounters"
  );

  type PlannedEvent = {
    encounterId: string;
    encounterLabel: "A" | "B";
    create: (input: { patientId: string; payload: Record<string, unknown> }) => ClinicalEvent;
    expectedType: ClinicalEventType;
    payload: Record<string, unknown>;
  };

  const plan: PlannedEvent[] = [
    {
      encounterId: encounterA.id,
      encounterLabel: "A",
      create: createObservationEvent,
      expectedType: "observation",
      payload: { value: 98.6 },
    },
    {
      encounterId: encounterB.id,
      encounterLabel: "B",
      create: createMedicationEvent,
      expectedType: "medication",
      payload: { name: "Ibuprofen" },
    },
    {
      encounterId: encounterA.id,
      encounterLabel: "A",
      create: createDiagnosisEvent,
      expectedType: "diagnosis",
      payload: { code: "J06.9" },
    },
    {
      encounterId: encounterB.id,
      encounterLabel: "B",
      create: createLabResultEvent,
      expectedType: "lab_result",
      payload: { test: "CBC" },
    },
    {
      encounterId: encounterA.id,
      encounterLabel: "A",
      create: createProcedureEvent,
      expectedType: "procedure",
      payload: { name: "Wound care" },
    },
    {
      encounterId: encounterB.id,
      encounterLabel: "B",
      create: createObservationEvent,
      expectedType: "observation",
      payload: { value: 120 },
    },
  ];

  const createdEvents: ClinicalEvent[] = [];

  for (const step of plan) {
    const event = step.create({ patientId, payload: step.payload });
    assert(event.type === step.expectedType, `Expected type ${step.expectedType}`);

    addEventToEncounter(step.encounterId, event.id);
    appendEvent(patientId, toTimelineClinicalEvent(event));
    createdEvents.push(event);

    await sleep(5);
  }

  const updatedEncounterA = getEncounter(encounterA.id);
  const updatedEncounterB = getEncounter(encounterB.id);

  assert(updatedEncounterA !== null, "Encounter A must exist");
  assert(updatedEncounterB !== null, "Encounter B must exist");
  assert(
    updatedEncounterA.eventIds.length === 3,
    `Encounter A must have exactly 3 events, got ${updatedEncounterA.eventIds.length}`
  );
  assert(
    updatedEncounterB.eventIds.length === 3,
    `Encounter B must have exactly 3 events, got ${updatedEncounterB.eventIds.length}`
  );

  const timeline = getPatientTimeline(patientId);

  assert(timeline.length === 6, `Expected 6 timeline events, got ${timeline.length}`);
  assertTimelineSorted(timeline);
  assertStrictTemporalOrder(createdEvents);

  const timelineIds = timeline.map((entry) => entry.id);
  const creationIds = createdEvents.map((event) => event.id);

  assert(
    timelineIds.every((id, index) => id === creationIds[index]),
    "Timeline order must follow timestamp order, not encounter grouping"
  );

  const encounterLabelsInTimelineOrder = timelineIds.map((id) => {
    const index = createdEvents.findIndex((event) => event.id === id);
    return plan[index]?.encounterLabel;
  });

  assert(
    encounterLabelsInTimelineOrder.join("") === "ABABAB",
    "Timeline must preserve interleaved encounter activity (expected ABABAB pattern)"
  );

  for (const event of createdEvents) {
    const found = timeline.find((entry) => entry.id === event.id);
    assert(found !== undefined, `Event ${event.id} missing from timeline`);
    assert(
      found.eventType === event.type,
      `Event type not preserved for ${event.id}: expected ${event.type}, got ${found.eventType}`
    );
  }

  console.log("AFIA TEMPORAL CONSISTENCY TEST PASSED");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
