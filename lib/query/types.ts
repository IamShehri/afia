import type { Patient } from "../patient/types";
import type { Episode } from "../episode/types";
import type { Encounter } from "../encounter/types";
import type { ClinicalEvent } from "../clinical-timeline/types";

export type EncounterClinicalNode = {
  encounter: Encounter;
  events: ClinicalEvent[];
};

export type EpisodeClinicalNode = {
  episode: Episode;
  encounters: EncounterClinicalNode[];
};

export type PatientClinicalGraph = {
  patient: Patient;
  episodes: EpisodeClinicalNode[];
};

export type EpisodeClinicalGraph = {
  episode: Episode;
  encounters: EncounterClinicalNode[];
  eventsFlattened: ClinicalEvent[];
};

export type UnifiedTimelineEntry = ClinicalEvent & {
  encounterId: string | null;
  episodeId: string | null;
};
