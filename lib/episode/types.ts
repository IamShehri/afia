export type EpisodeStatus = "active" | "closed";

export type Episode = {
  id: string;
  patientId: string;
  title: string;
  startedAt: number;
  endedAt?: number | null;
  status: EpisodeStatus;
  encounterIds: string[];
};
