export type ClinicalEventType =
  | "observation"
  | "diagnosis"
  | "medication"
  | "procedure"
  | "encounter"
  | "lab_result";

export type ClinicalEvent = {
  id: string;
  patientId: string;
  timestamp: number;
  type: ClinicalEventType;
  payload: Record<string, any>;
};

export type CreateClinicalEventFactoryInput = {
  patientId: string;
  payload: Record<string, any>;
};
