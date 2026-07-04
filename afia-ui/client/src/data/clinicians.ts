import type { Clinician } from "./types";

export const clinicians: Clinician[] = [
  { id: "c1", name: "Dr. Naomi Okafor", role: "Attending", specialty: "Internal Medicine", initials: "NO", hue: 252 },
  { id: "c2", name: "Dr. Elias Vance", role: "Attending", specialty: "Cardiology", initials: "EV", hue: 288 },
  { id: "c3", name: "Dr. Priya Nadar", role: "Resident", specialty: "Endocrinology", initials: "PN", hue: 160 },
  { id: "c4", name: "Dr. Marcus Hale", role: "Attending", specialty: "Pulmonology", initials: "MH", hue: 210 },
  { id: "c5", name: "Sana Whitfield, NP", role: "Nurse Practitioner", specialty: "Primary Care", initials: "SW", hue: 70 },
  { id: "c6", name: "Dr. Lena Sørensen", role: "Attending", specialty: "Neurology", initials: "LS", hue: 320 },
];

export const clinicianById = (id: string) =>
  clinicians.find((c) => c.id === id);

export const currentUser: Clinician = clinicians[0];
