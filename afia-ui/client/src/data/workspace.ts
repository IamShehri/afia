import type { Appointment, InboxItem, AiSuggestion } from "./types";
import { patients } from "./patients";

const day = (h: number, m = 0) => {
  const d = new Date("2026-07-01T00:00:00Z");
  d.setUTCHours(h, m, 0, 0);
  return d.toISOString();
};

const pk = (i: number) => patients[i % patients.length];

export const appointments: Appointment[] = [
  { id: "a1", patientId: pk(0).id, patientName: pk(0).name, clinicianId: "c1", start: day(8, 30), durationMin: 30, kind: "consult", location: "Room 4B-2", status: "checked-in" },
  { id: "a2", patientId: pk(3).id, patientName: pk(3).name, clinicianId: "c1", start: day(9, 0), durationMin: 20, kind: "follow-up", location: "Telehealth", status: "confirmed" },
  { id: "a3", patientId: pk(5).id, patientName: pk(5).name, clinicianId: "c2", start: day(9, 30), durationMin: 45, kind: "procedure", location: "Cath Lab 1", status: "confirmed" },
  { id: "a4", patientId: pk(2).id, patientName: pk(2).name, clinicianId: "c4", start: day(10, 0), durationMin: 30, kind: "consult", location: "Room 2A-5", status: "pending" },
  { id: "a5", patientId: pk(7).id, patientName: pk(7).name, clinicianId: "c1", start: day(10, 45), durationMin: 15, kind: "telehealth", location: "Telehealth", status: "confirmed" },
  { id: "a6", patientId: pk(9).id, patientName: pk(9).name, clinicianId: "c3", start: day(11, 15), durationMin: 30, kind: "intake", location: "Clinic — West", status: "confirmed" },
  { id: "a7", patientId: pk(4).id, patientName: pk(4).name, clinicianId: "c2", start: day(13, 0), durationMin: 30, kind: "follow-up", location: "Room 4B-1", status: "confirmed" },
  { id: "a8", patientId: pk(11).id, patientName: pk(11).name, clinicianId: "c1", start: day(13, 45), durationMin: 20, kind: "lab", location: "Day Unit", status: "pending" },
  { id: "a9", patientId: pk(6).id, patientName: pk(6).name, clinicianId: "c5", start: day(14, 30), durationMin: 30, kind: "consult", location: "Clinic — East", status: "confirmed" },
  { id: "a10", patientId: pk(13).id, patientName: pk(13).name, clinicianId: "c1", start: day(15, 15), durationMin: 45, kind: "follow-up", location: "Room 4B-2", status: "confirmed" },
  { id: "a11", patientId: pk(8).id, patientName: pk(8).name, clinicianId: "c6", start: day(16, 0), durationMin: 30, kind: "consult", location: "Room 2A-3", status: "cancelled" },
  { id: "a12", patientId: pk(15).id, patientName: pk(15).name, clinicianId: "c1", start: day(16, 45), durationMin: 20, kind: "telehealth", location: "Telehealth", status: "confirmed" },
];

export const inboxItems: InboxItem[] = [
  { id: "i1", kind: "result", priority: "critical", title: "Critical lab — Potassium 6.1", preview: "Repeat panel confirms hyperkalemia; recommend urgent review.", patientId: pk(0).id, patientName: pk(0).name, from: "Lab — Chemistry", at: day(8, 12), unread: true },
  { id: "i2", kind: "ai", priority: "high", title: "AFIA flagged a readmission risk", preview: "Three signals align with early decompensation for this patient.", patientId: pk(4).id, patientName: pk(4).name, from: "AFIA", at: day(8, 5), unread: true },
  { id: "i3", kind: "refill", priority: "moderate", title: "Refill request — Apixaban 5mg", preview: "Patient requests 90-day supply; last INR within range.", patientId: pk(7).id, patientName: pk(7).name, from: "Pharmacy", at: day(7, 50), unread: true },
  { id: "i4", kind: "message", priority: "low", title: "Question about morning dose", preview: "“Should I take the new tablet with food or before breakfast?”", patientId: pk(3).id, patientName: pk(3).name, from: pk(3).name, at: day(7, 30), unread: false },
  { id: "i5", kind: "referral", priority: "moderate", title: "Cardiology referral accepted", preview: "Dr. Vance accepted the referral; intake scheduled.", patientId: pk(5).id, patientName: pk(5).name, from: "Dr. E. Vance", at: day(7, 10), unread: false },
  { id: "i6", kind: "task", priority: "high", title: "Sign discharge summary", preview: "Discharge summary is ready and awaiting your signature.", patientId: pk(2).id, patientName: pk(2).name, from: "Care Coordination", at: day(6, 55), unread: true },
  { id: "i7", kind: "result", priority: "low", title: "Imaging resulted — Chest X-ray", preview: "No acute findings. Compared with prior study.", patientId: pk(9).id, patientName: pk(9).name, from: "Radiology", at: day(6, 40), unread: false },
  { id: "i8", kind: "message", priority: "low", title: "Thanks for yesterday", preview: "“Feeling much better today, thank you for the quick visit.”", patientId: pk(6).id, patientName: pk(6).name, from: pk(6).name, at: day(6, 20), unread: false },
];

export const aiSuggestions: AiSuggestion[] = [
  { id: "s1", tone: "warning", title: "2 patients match early-deterioration patterns", body: "Vitals and recent labs for Ward 4B suggest closer monitoring for two patients today.", cta: "Review patients" },
  { id: "s2", tone: "action", title: "5 care gaps closeable this morning", body: "Overdue A1c, lipid panels, and vaccinations across your active panel can be ordered in one batch.", cta: "Open batch orders" },
  { id: "s3", tone: "insight", title: "Your schedule has a 40-min window at 11:45", body: "Three pending tasks fit neatly into the gap after your intake block.", cta: "Plan the window" },
];

/* ---- formatting helpers ---- */
export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const fmtDateTime = (iso: string) =>
  `${fmtDate(iso)} · ${fmtTime(iso)}`;

const NOW = new Date("2026-07-01T09:30:00Z").getTime();
export const fmtRelative = (iso: string) => {
  const diff = NOW - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (Math.abs(min) < 60) return min <= 0 ? "now" : `${min}m ago`;
  const hr = Math.round(min / 60);
  if (Math.abs(hr) < 24) return hr <= 0 ? `in ${-hr}h` : `${hr}h ago`;
  const d = Math.round(hr / 24);
  return d <= 0 ? `in ${-d}d` : `${d}d ago`;
};
