import type { UnifiedTimelineEntry } from "../query/types";
import type { PatientClinicalGraph } from "../query/types";

export type PatientSummary = {
  patientId: string;
  totalEpisodes: number;
  totalEncounters: number;
  totalEvents: number;
  activeEpisodes: number;
  activeEncounters: number;
  mostRecentEvent: UnifiedTimelineEntry | null;
  timelineSpan: {
    start: number;
    end: number;
  };
};

export type EpisodeInsights = {
  episodeId: string;
  eventTypeDistribution: Record<string, number>;
  encounterFrequency: number;
  episodeDuration: number;
  mostActiveEncounter: {
    encounterId: string;
    eventCount: number;
  } | null;
  eventDensity: number;
};

export type EpisodeEncounterFrequency = {
  episodeId: string;
  encounterCount: number;
};

export type ActivityHotspot = {
  encounterId: string;
  episodeId: string;
  eventCount: number;
};

export type PatientActivityProfile = {
  patientId: string;
  eventTypeBreakdown: Record<string, number>;
  encounterFrequencyPerEpisode: EpisodeEncounterFrequency[];
  activityHotspots: ActivityHotspot[];
};
