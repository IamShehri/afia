export type ClinicalEvent = {
  id: string;
  patientId: string;
  timestamp: number;
  eventType: string;
  payload: Record<string, any>;
};

export type CreateClinicalEventInput = {
  patientId: string;
  timestamp: number;
  eventType: string;
  payload: Record<string, any>;
};
