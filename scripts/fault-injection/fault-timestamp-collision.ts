import { createPatient } from "../../lib/patient/index";
import { createEncounter, addEventToEncounter } from "../../lib/encounter/index";
import { createClinicalEvent, appendEvent, getPatientTimeline } from "../../lib/clinical-timeline/index";
import {
  getPatientUnifiedTimeline,
} from "../../lib/query/index";
import {
  getPatientSummary,
} from "../../lib/reasoning/index";
import {
  assert,
  assertNoThrow,
  assertTimelineSorted,
  runFaultTest,
} from "./fault-helpers";

function main(): void {
  runFaultTest("fault-timestamp-collision", () => {
    const patient = createPatient({ name: "Fault Timestamp Collision" });
    const patientId = patient.id;
    const encounter = createEncounter(patientId);
    const collisionTimestamp = Date.now();

    const eventA = createClinicalEvent({
      patientId,
      timestamp: collisionTimestamp,
      eventType: "observation",
      payload: { order: "first" },
    });
    const eventB = createClinicalEvent({
      patientId,
      timestamp: collisionTimestamp,
      eventType: "medication",
      payload: { order: "second" },
    });
    const eventC = createClinicalEvent({
      patientId,
      timestamp: collisionTimestamp,
      eventType: "lab_result",
      payload: { order: "third" },
    });

    addEventToEncounter(encounter.id, eventA.id);
    addEventToEncounter(encounter.id, eventB.id);
    addEventToEncounter(encounter.id, eventC.id);

    appendEvent(patientId, eventA);
    appendEvent(patientId, eventB);
    appendEvent(patientId, eventC);

    assertNoThrow("getPatientTimeline", () => {
      getPatientTimeline(patientId);
    });
    assertNoThrow("getPatientUnifiedTimeline", () => {
      getPatientUnifiedTimeline(patientId);
    });
    assertNoThrow("getPatientSummary", () => {
      getPatientSummary(patientId);
    });

    const timeline = getPatientTimeline(patientId);
    const unified = getPatientUnifiedTimeline(patientId);

    assert(timeline.length === 3, "All colliding events must remain in timeline");
    assertTimelineSorted(timeline);
    assertTimelineSorted(unified);

    for (const event of timeline) {
      assert(
        event.timestamp === collisionTimestamp,
        "Timestamp collision simulation must preserve identical timestamps"
      );
    }

    assert(
      timeline[0].id === eventA.id &&
        timeline[1].id === eventB.id &&
        timeline[2].id === eventC.id,
      "Colliding timestamps must preserve stable append order"
    );

    const summary = getPatientSummary(patientId);
    assert(summary.totalEvents === 3, "Reasoning must include all colliding events");
    assert(
      summary.timelineSpan.start === collisionTimestamp &&
        summary.timelineSpan.end === collisionTimestamp,
      "Timeline span must reflect collision timestamp"
    );
  });
}

main();
