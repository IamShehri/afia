export interface Stat {
  id: string;
  label: string;
  value: string;
  delta: number;
  trend: "up" | "down";
  positive: boolean;
  series: number[];
}

export const stats: Stat[] = [
  {
    id: "patients",
    label: "Active patients",
    value: "248",
    delta: 4.2,
    trend: "up",
    positive: true,
    series: [42, 44, 43, 47, 49, 52, 51, 55, 58, 61, 63, 67],
  },
  {
    id: "encounters",
    label: "Encounters today",
    value: "37",
    delta: 12.5,
    trend: "up",
    positive: true,
    series: [12, 18, 15, 22, 19, 26, 24, 30, 28, 33, 31, 37],
  },
  {
    id: "ai-time",
    label: "Time saved by AI",
    value: "14.2h",
    delta: 8.1,
    trend: "up",
    positive: true,
    series: [4, 6, 5, 8, 7, 9, 11, 10, 12, 13, 13, 14],
  },
  {
    id: "pending",
    label: "Pending results",
    value: "12",
    delta: 3.0,
    trend: "down",
    positive: true,
    series: [28, 26, 24, 22, 21, 19, 18, 16, 15, 14, 13, 12],
  },
];

export interface VolumePoint {
  label: string;
  encounters: number;
  aiAssisted: number;
}

export const volumeData: VolumePoint[] = [
  { label: "Mon", encounters: 32, aiAssisted: 21 },
  { label: "Tue", encounters: 41, aiAssisted: 28 },
  { label: "Wed", encounters: 38, aiAssisted: 26 },
  { label: "Thu", encounters: 47, aiAssisted: 34 },
  { label: "Fri", encounters: 52, aiAssisted: 40 },
  { label: "Sat", encounters: 24, aiAssisted: 17 },
  { label: "Sun", encounters: 18, aiAssisted: 12 },
];

export interface AcuitySlice {
  label: string;
  value: number;
  color: string;
}

export const acuityData: AcuitySlice[] = [
  { label: "Routine", value: 142, color: "hsl(var(--primary))" },
  { label: "Urgent", value: 64, color: "hsl(var(--cyan))" },
  { label: "Critical", value: 18, color: "hsl(var(--warning))" },
  { label: "Follow-up", value: 24, color: "hsl(var(--accent))" },
];

export type PatientStatus = "stable" | "monitoring" | "critical" | "discharged";

export interface Patient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  sex: "M" | "F";
  condition: string;
  provider: string;
  status: PatientStatus;
  risk: number;
  lastSeen: string;
  room?: string;
}

export const patients: Patient[] = [
  {
    id: "p1",
    mrn: "MRN-48201",
    name: "Amara Okafor",
    age: 54,
    sex: "F",
    condition: "Type 2 Diabetes",
    provider: "Dr. Reyes",
    status: "monitoring",
    risk: 68,
    lastSeen: "2h ago",
    room: "3B-12",
  },
  {
    id: "p2",
    mrn: "MRN-39112",
    name: "James Whitfield",
    age: 71,
    sex: "M",
    condition: "Atrial Fibrillation",
    provider: "Dr. Sato",
    status: "critical",
    risk: 91,
    lastSeen: "18m ago",
    room: "ICU-04",
  },
  {
    id: "p3",
    mrn: "MRN-55920",
    name: "Lena Hoffmann",
    age: 33,
    sex: "F",
    condition: "Post-op recovery",
    provider: "Dr. Reyes",
    status: "stable",
    risk: 22,
    lastSeen: "1h ago",
    room: "2A-07",
  },
  {
    id: "p4",
    mrn: "MRN-61038",
    name: "Diego Marquez",
    age: 47,
    sex: "M",
    condition: "Hypertension",
    provider: "Dr. Lindqvist",
    status: "stable",
    risk: 35,
    lastSeen: "4h ago",
  },
  {
    id: "p5",
    mrn: "MRN-22877",
    name: "Priya Nair",
    age: 29,
    sex: "F",
    condition: "Asthma exacerbation",
    provider: "Dr. Sato",
    status: "monitoring",
    risk: 54,
    lastSeen: "32m ago",
    room: "4C-21",
  },
  {
    id: "p6",
    mrn: "MRN-70314",
    name: "Robert Chen",
    age: 63,
    sex: "M",
    condition: "CHF",
    provider: "Dr. Lindqvist",
    status: "critical",
    risk: 84,
    lastSeen: "9m ago",
    room: "ICU-02",
  },
  {
    id: "p7",
    mrn: "MRN-18445",
    name: "Sofia Romano",
    age: 41,
    sex: "F",
    condition: "Migraine",
    provider: "Dr. Reyes",
    status: "discharged",
    risk: 12,
    lastSeen: "Yesterday",
  },
];

export const statusLabels: Record<PatientStatus, string> = {
  stable: "Stable",
  monitoring: "Monitoring",
  critical: "Critical",
  discharged: "Discharged",
};

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  detail: string;
  kind: "ai" | "lab" | "note" | "med" | "alert";
}

export const timeline: TimelineEvent[] = [
  {
    id: "t1",
    time: "09:42",
    title: "AI summary generated",
    detail: "Discharge summary drafted for Lena Hoffmann.",
    kind: "ai",
  },
  {
    id: "t2",
    time: "09:18",
    title: "Critical lab flagged",
    detail: "Potassium 6.1 mmol/L — James Whitfield.",
    kind: "alert",
  },
  {
    id: "t3",
    time: "08:55",
    title: "Medication reconciled",
    detail: "Metformin dosage adjusted by Dr. Reyes.",
    kind: "med",
  },
  {
    id: "t4",
    time: "08:30",
    title: "Progress note signed",
    detail: "Robert Chen — cardiology follow-up.",
    kind: "note",
  },
  {
    id: "t5",
    time: "08:02",
    title: "Lab results received",
    detail: "CBC panel for Priya Nair within range.",
    kind: "lab",
  },
];

export interface AiSuggestion {
  id: string;
  title: string;
  detail: string;
  confidence: number;
}

export const aiSuggestions: AiSuggestion[] = [
  {
    id: "s1",
    title: "Order follow-up ECG",
    detail: "Recurrent palpitations noted across last 3 encounters.",
    confidence: 92,
  },
  {
    id: "s2",
    title: "Adjust insulin regimen",
    detail: "Morning glucose trending high over 7 days.",
    confidence: 78,
  },
  {
    id: "s3",
    title: "Schedule nutrition consult",
    detail: "BMI and lab markers suggest dietary intervention.",
    confidence: 64,
  },
];

export interface ScheduleItem {
  id: string;
  time: string;
  patient: string;
  type: string;
  status: "upcoming" | "in-progress" | "done";
}

export const schedule: ScheduleItem[] = [
  { id: "a1", time: "10:00", patient: "Amara Okafor", type: "Endocrine review", status: "in-progress" },
  { id: "a2", time: "10:30", patient: "Diego Marquez", type: "BP follow-up", status: "upcoming" },
  { id: "a3", time: "11:15", patient: "Priya Nair", type: "Pulmonary check", status: "upcoming" },
  { id: "a4", time: "13:00", patient: "Sofia Romano", type: "Neurology consult", status: "upcoming" },
];
