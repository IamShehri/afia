// Static presentation data for the AFIA shell.
// The UI renders state and collects intent only — this module holds no business rules.

export type PatientStatus = "stable" | "monitoring" | "critical" | "discharged";
export type Priority = "routine" | "elevated" | "urgent";

export interface Patient {
  id: string;
  name: string;
  mrn: string;
  age: number;
  sex: "F" | "M" | "X";
  status: PatientStatus;
  priority: Priority;
  room: string;
  condition: string;
  provider: string;
  lastUpdated: string; // ISO
  vitalsTrend: number[];
  riskScore: number;
}

export interface ActivityItem {
  id: string;
  kind: "note" | "lab" | "order" | "admit" | "ai";
  title: string;
  detail: string;
  actor: string;
  time: string; // ISO
}

export interface AiSuggestion {
  id: string;
  title: string;
  rationale: string;
  confidence: number;
  tag: string;
}

const now = Date.now();
const minsAgo = (m: number) => new Date(now - m * 60000).toISOString();

export const patients: Patient[] = [
  {
    id: "p-1042",
    name: "Amara Okafor",
    mrn: "MRN-44821",
    age: 54,
    sex: "F",
    status: "monitoring",
    priority: "elevated",
    room: "4B-12",
    condition: "Post-op cardiac monitoring",
    provider: "Dr. Lin",
    lastUpdated: minsAgo(8),
    vitalsTrend: [72, 74, 73, 78, 82, 79, 76],
    riskScore: 42,
  },
  {
    id: "p-1043",
    name: "Daniel Reyes",
    mrn: "MRN-44822",
    age: 67,
    sex: "M",
    status: "critical",
    priority: "urgent",
    room: "ICU-3",
    condition: "Acute respiratory distress",
    provider: "Dr. Haddad",
    lastUpdated: minsAgo(3),
    vitalsTrend: [88, 90, 94, 97, 99, 101, 104],
    riskScore: 81,
  },
  {
    id: "p-1044",
    name: "Sofia Bianchi",
    mrn: "MRN-44823",
    age: 39,
    sex: "F",
    status: "stable",
    priority: "routine",
    room: "2A-07",
    condition: "Observation — migraine",
    provider: "Dr. Lin",
    lastUpdated: minsAgo(22),
    vitalsTrend: [68, 67, 69, 70, 68, 67, 66],
    riskScore: 14,
  },
  {
    id: "p-1045",
    name: "Marcus Webb",
    mrn: "MRN-44824",
    age: 71,
    sex: "M",
    status: "monitoring",
    priority: "elevated",
    room: "4B-09",
    condition: "Diabetic ketoacidosis",
    provider: "Dr. Osei",
    lastUpdated: minsAgo(14),
    vitalsTrend: [76, 78, 80, 79, 83, 85, 84],
    riskScore: 57,
  },
  {
    id: "p-1046",
    name: "Yuki Tanaka",
    mrn: "MRN-44825",
    age: 28,
    sex: "F",
    status: "stable",
    priority: "routine",
    room: "2A-11",
    condition: "Appendectomy recovery",
    provider: "Dr. Haddad",
    lastUpdated: minsAgo(41),
    vitalsTrend: [70, 71, 70, 69, 70, 72, 71],
    riskScore: 9,
  },
  {
    id: "p-1047",
    name: "Elena Petrova",
    mrn: "MRN-44826",
    age: 62,
    sex: "F",
    status: "monitoring",
    priority: "elevated",
    room: "3C-04",
    condition: "Sepsis protocol",
    provider: "Dr. Osei",
    lastUpdated: minsAgo(6),
    vitalsTrend: [82, 85, 88, 86, 90, 92, 91],
    riskScore: 68,
  },
  {
    id: "p-1048",
    name: "James Carter",
    mrn: "MRN-44827",
    age: 45,
    sex: "M",
    status: "discharged",
    priority: "routine",
    room: "—",
    condition: "Fracture — discharged",
    provider: "Dr. Lin",
    lastUpdated: minsAgo(120),
    vitalsTrend: [70, 70, 69, 70, 71, 70, 70],
    riskScore: 5,
  },
  {
    id: "p-1049",
    name: "Nadia Hassan",
    mrn: "MRN-44828",
    age: 58,
    sex: "F",
    status: "stable",
    priority: "routine",
    room: "2A-03",
    condition: "Hypertension review",
    provider: "Dr. Haddad",
    lastUpdated: minsAgo(33),
    vitalsTrend: [74, 73, 75, 74, 73, 72, 74],
    riskScore: 21,
  },
];

export const activity: ActivityItem[] = [
  {
    id: "a-1",
    kind: "ai",
    title: "AFIA flagged a deterioration trend",
    detail: "Daniel Reyes — rising respiratory rate over 40 min",
    actor: "AFIA",
    time: minsAgo(3),
  },
  {
    id: "a-2",
    kind: "lab",
    title: "Lab results posted",
    detail: "Elena Petrova — lactate 3.2 mmol/L",
    actor: "Lab",
    time: minsAgo(6),
  },
  {
    id: "a-3",
    kind: "order",
    title: "Order signed",
    detail: "Marcus Webb — insulin drip protocol",
    actor: "Dr. Osei",
    time: minsAgo(14),
  },
  {
    id: "a-4",
    kind: "note",
    title: "Progress note added",
    detail: "Amara Okafor — post-op day 2",
    actor: "Dr. Lin",
    time: minsAgo(18),
  },
  {
    id: "a-5",
    kind: "admit",
    title: "New admission",
    detail: "Sofia Bianchi assigned to 2A-07",
    actor: "Front desk",
    time: minsAgo(22),
  },
];

export const aiSuggestions: AiSuggestion[] = [
  {
    id: "s-1",
    title: "Escalate Daniel Reyes to rapid response",
    rationale:
      "Respiratory rate trending upward with SpO2 decline. Pattern matches early ARDS deterioration.",
    confidence: 0.92,
    tag: "Critical",
  },
  {
    id: "s-2",
    title: "Recheck Elena Petrova lactate in 2h",
    rationale:
      "Sepsis bundle in progress. Repeat lactate recommended to confirm clearance trajectory.",
    confidence: 0.78,
    tag: "Protocol",
  },
  {
    id: "s-3",
    title: "Consider discharge planning for Yuki Tanaka",
    rationale:
      "Vitals stable for 36h, ambulating independently, pain controlled on oral meds.",
    confidence: 0.71,
    tag: "Throughput",
  },
];

export interface MetricPoint {
  label: string;
  admissions: number;
  discharges: number;
  occupancy: number;
}

export const census: MetricPoint[] = [
  { label: "Mon", admissions: 24, discharges: 18, occupancy: 78 },
  { label: "Tue", admissions: 31, discharges: 22, occupancy: 82 },
  { label: "Wed", admissions: 28, discharges: 26, occupancy: 80 },
  { label: "Thu", admissions: 35, discharges: 24, occupancy: 86 },
  { label: "Fri", admissions: 30, discharges: 29, occupancy: 84 },
  { label: "Sat", admissions: 19, discharges: 25, occupancy: 76 },
  { label: "Sun", admissions: 16, discharges: 20, occupancy: 72 },
];

export const statusMeta: Record<
  PatientStatus,
  { label: string; variant: "success" | "warning" | "destructive" | "default" }
> = {
  stable: { label: "Stable", variant: "success" },
  monitoring: { label: "Monitoring", variant: "warning" },
  critical: { label: "Critical", variant: "destructive" },
  discharged: { label: "Discharged", variant: "default" },
};
