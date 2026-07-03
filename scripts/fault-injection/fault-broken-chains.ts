import { createPatient } from "../../lib/patient/index";
import { createEpisode, getEpisode } from "../../lib/episode/index";
import {
  getPatientClinicalGraph,
  getEpisodeClinicalGraph,
} from "../../lib/query/index";
import {
  getEpisodeInsights,
  getPatientSummary,
} from "../../lib/reasoning/index";
import {
  assert,
  assertNoThrow,
  runFaultTest,
} from "./fault-helpers";

function main(): void {
  runFaultTest("fault-broken-chains", () => {
    const patient = createPatient({ name: "Fault Broken Chains" });
    const episode = createEpisode(patient.id, "Broken Chain Episode");

    const episodeRecord = getEpisode(episode.id);
    assert(episodeRecord !== null, "Episode must exist for fault simulation");
    episodeRecord.encounterIds.push("enc_missing_chain_000");

    assertNoThrow("getPatientClinicalGraph", () => {
      getPatientClinicalGraph(patient.id);
    });
    assertNoThrow("getEpisodeClinicalGraph", () => {
      getEpisodeClinicalGraph(episode.id);
    });
    assertNoThrow("getEpisodeInsights", () => {
      getEpisodeInsights(episode.id);
    });
    assertNoThrow("getPatientSummary", () => {
      getPatientSummary(patient.id);
    });

    const graph = getPatientClinicalGraph(patient.id);
    const episodeNode = graph.episodes.find(
      (node) => node.episode.id === episode.id
    );

    assert(episodeNode !== undefined, "Episode must remain in patient graph");
    assert(
      episodeNode.encounters.length === 0,
      "Broken encounter references must be skipped safely"
    );

    const episodeGraph = getEpisodeClinicalGraph(episode.id);
    assert(
      episodeGraph.encounters.length === 0,
      "Episode graph must skip missing encounter references"
    );
    assert(
      episodeGraph.eventsFlattened.length === 0,
      "Broken chains must not produce phantom events"
    );

    const insights = getEpisodeInsights(episode.id);
    assert(insights.encounterFrequency === 0, "Insights must degrade gracefully");
    assert(insights.eventDensity === 0, "Event density must be zero without encounters");
  });
}

main();
