import { createPatient } from "../../lib/patient/index";
import { createEncounter, addEventToEncounter } from "../../lib/encounter/index";
import { createEpisode, addEncounterToEpisode } from "../../lib/episode/index";
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
  runFaultTest,
} from "./fault-helpers";

function main(): void {
  runFaultTest("fault-missing-references", () => {
    const patient = createPatient({ name: "Fault Missing References" });
    const episode = createEpisode(patient.id, "Missing Reference Episode");
    const encounter = createEncounter(patient.id);

    addEncounterToEpisode(episode.id, encounter.id);
    addEventToEncounter(encounter.id, "evt_missing_reference_000");

    assertNoThrow("getPatientClinicalGraph", () => {
      getPatientClinicalGraph(patient.id);
    });
    assertNoThrow("getPatientUnifiedTimeline", () => {
      getPatientUnifiedTimeline(patient.id);
    });
    assertNoThrow("getPatientSummary", () => {
      getPatientSummary(patient.id);
    });
    assertNoThrow("getPatientActivityProfile", () => {
      getPatientActivityProfile(patient.id);
    });

    const graph = getPatientClinicalGraph(patient.id);
    const episodeNode = graph.episodes.find(
      (node) => node.episode.id === episode.id
    );

    assert(episodeNode !== undefined, "Episode must remain in patient graph");
    assert(episodeNode.encounters.length === 1, "Encounter must remain linked to episode");

    const encounterNode = episodeNode.encounters[0];
    assert(
      encounterNode.events.length === 0,
      "Missing event references must not surface phantom timeline events"
    );
    assert(
      encounterNode.encounter.eventIds.includes("evt_missing_reference_000"),
      "Fault injection must preserve corrupted encounter reference for simulation"
    );
  });
}

main();
