export type EncounterStatus = "active" | "closed";

export type Encounter = {
  id: string;
  patientId: string;
  startedAt: number;
  endedAt?: number | null;
  status: EncounterStatus;
  eventIds: string[];
};
