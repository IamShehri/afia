import { createPatient, getPatient } from "../lib/patient/index";
import {
  createDiagnosisEvent,
  createMedicationEvent,
  createObservationEvent,
} from "../lib/clinical-events/factories";
import { toTimelineClinicalEvent } from "../lib/clinical-events/adapter";
import { appendEvent, getPatientTimeline } from "../lib/clinical-timeline/index";

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

function main(): void {
  const patient = createPatient({ name: "Journey Test Patient" });
  const patientId = patient.id;

  assert(!!patientId && typeof patientId === "string", "Patient must have valid id");
  assert(getPatient(patientId) !== null, "Patient must exist in store");

  const semanticEvents = [
    createObservationEvent({ patientId, payload: { value: 98.6 } }),
    createDiagnosisEvent({ patientId, payload: { code: "J06.9" } }),
    createMedicationEvent({ patientId, payload: { name: "Ibuprofen" } }),
  ];

  for (const event of semanticEvents) {
    const timelineEvent = toTimelineClinicalEvent(event);
    assert(
      timelineEvent.eventType === event.type,
      `type → eventType mapping failed for ${event.type}`
    );
    assert(
      timelineEvent.patientId === patientId,
      "Timeline event patientId must match patient"
    );
    appendEvent(patientId, timelineEvent);
  }

  const timeline = getPatientTimeline(patientId);

  assert(timeline.length === 3, `Expected 3 events, got ${timeline.length}`);

  for (const event of semanticEvents) {
    const found = timeline.find((entry) => entry.id === event.id);
    assert(found !== undefined, `Event ${event.id} missing from timeline`);
    assert(
      found.eventType === event.type,
      `Event type not preserved for ${event.id}: expected ${event.type}, got ${found.eventType}`
    );
  }

  assertTimelineSorted(timeline);

  console.log("AFIA PATIENT JOURNEY TEST PASSED");
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
