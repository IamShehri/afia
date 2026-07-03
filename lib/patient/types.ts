export type Patient = {
  id: string;
  name: string;
  createdAt: number;
};

export type CreatePatientInput = {
  name: string;
};
