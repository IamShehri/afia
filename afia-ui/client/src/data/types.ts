export type Sex = "F" | "M" | "X";

export type PatientStatus = "active" | "admitted" | "observation" | "discharged" | "follow-up";

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export type FlagKind = "vitals" | "lab" | "medication" | "ai" | "admin";

export interface Vital {
  label: string;
  value: string;
  unit?: string;
  trend?: "up" | "down" | "flat";
  state?: "normal" | "watch" | "alert";
}

export interface ClinicalFlag {
  id: string;
  kind: FlagKind;
  severity: RiskLevel;
  message: string;
  at: string; // ISO
}

export interface TimelineEvent {
  id: string;
  at: string; // ISO
  type: "visit" | "lab" | "note" | "med" | "ai" | "admit" | "message";
  title: string;
  detail?: string;
  author?: string;
}

export interface Patient {
  id: string; // MRN
  name: string;
  age: number;
  sex: Sex;
  status: PatientStatus;
  risk: RiskLevel;
  riskScore: number; // 0-100
  condition: string;
  careTeam: string; // primary clinician id
  room?: string;
  location: string;
  lastSeen: string; // ISO
  nextAppt?: string; // ISO
  insurer: string;
  flags: ClinicalFlag[];
  vitals: Vital[];
  timeline: TimelineEvent[];
  allergies: string[];
  medications: { name: string; dose: string; freq: string }[];
  notes?: string;
  aiSummary: string;
}

export interface Clinician {
  id: string;
  name: string;
  role: string;
  specialty: string;
  initials: string;
  hue: number; // for avatar tint
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  clinicianId: string;
  start: string; // ISO
  durationMin: number;
  kind: "consult" | "follow-up" | "procedure" | "telehealth" | "lab" | "intake";
  location: string;
  status: "confirmed" | "pending" | "checked-in" | "completed" | "cancelled";
}

export interface InboxItem {
  id: string;
  kind: "result" | "refill" | "message" | "referral" | "task" | "ai";
  priority: RiskLevel;
  title: string;
  preview: string;
  patientId?: string;
  patientName?: string;
  from: string;
  at: string; // ISO
  unread: boolean;
}

export interface AiSuggestion {
  id: string;
  tone: "insight" | "action" | "warning";
  title: string;
  body: string;
  cta?: string;
}
