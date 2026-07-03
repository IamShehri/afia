import { createPatient } from "../../lib/patient/index";
import { createClinicalEvent, appendEvent, getPatientTimeline } from "../../lib/clinical-timeline/index";
import {
  getPatientClinicalGraph,
  getPatientUnifiedTimeline,
} from "../../lib/query/index";
import {
  getPatientSummary,
  getPatientActivityProfile,
} from "../../lib/reasoning/index";
import {
  assert,
  assertNoThrow,
  assertTimelineSorted,
  runFaultTest,
} from "./fault-helpers";

function main(): void {
  runFaultTest("fault-orphan-events", () => {
    const patient = createPatient({ name: "Fault Orphan Events" });
    const patientId = patient.id;
    const timestamp = Date.now();

    const orphanA = createClinicalEvent({
      patientId,
      timestamp,
      eventType: "observation",
      payload: { orphan: true, label: "A" },
    });
    const orphanB = createClinicalEvent({
      patientId,
      timestamp,
      eventType: "diagnosis",
      payload: { orphan: true, label: "B" },
    });

    appendEvent(patientId, orphanA);
    appendEvent(patientId, orphanB);

    assertNoThrow("getPatientClinicalGraph", () => {
      getPatientClinicalGraph(patientId);
    });
    assertNoThrow("getPatientUnifiedTimeline", () => {
      getPatientUnifiedTimeline(patientId);
    });
    assertNoThrow("getPatientSummary", () => {
      getPatientSummary(patientId);
    });
    assertNoThrow("getPatientActivityProfile", () => {
      getPatientActivityProfile(patientId);
    });

    const timeline = getPatientTimeline(patientId);
    const unified = getPatientUnifiedTimeline(patientId);

    assert(timeline.length === 2, "Orphan events must remain in timeline");
    assertTimelineSorted(timeline);
    assertTimelineSorted(unified);

    for (const entry of unified) {
      assert(entry.encounterId === null, "Orphan events must not resolve to an encounter");
      assert(entry.episodeId === null, "Orphan events must not resolve to an episode");
    }

    const summary = getPatientSummary(patientId);
    assert(summary.totalEvents === 2, "Reasoning must count orphan timeline events");
  });
}

main();
