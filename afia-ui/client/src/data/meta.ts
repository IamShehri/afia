import type { RiskLevel, PatientStatus } from "./types";

export const riskMeta: Record<
  RiskLevel,
  { label: string; dot: string; text: string; chip: string }
> = {
  low: {
    label: "Low",
    dot: "bg-success",
    text: "text-success",
    chip: "bg-success/10 text-success border-success/20",
  },
  moderate: {
    label: "Moderate",
    dot: "bg-warning",
    text: "text-warning",
    chip: "bg-warning/10 text-warning border-warning/20",
  },
  high: {
    label: "High",
    dot: "bg-risk-high",
    text: "text-risk-high",
    chip: "bg-risk-high/10 text-risk-high border-risk-high/20",
  },
  critical: {
    label: "Critical",
    dot: "bg-destructive",
    text: "text-destructive",
    chip: "bg-destructive/10 text-destructive border-destructive/25",
  },
};

export const statusMeta: Record<PatientStatus, { label: string; chip: string }> = {
  active: { label: "Active", chip: "bg-primary/10 text-primary border-primary/20" },
  admitted: { label: "Admitted", chip: "bg-ai/12 text-ai border-ai/25" },
  observation: { label: "Observation", chip: "bg-warning/10 text-warning border-warning/20" },
  discharged: { label: "Discharged", chip: "bg-muted text-muted-foreground border-border" },
  "follow-up": { label: "Follow-up", chip: "bg-info/12 text-info border-info/25" },
};

export type AppointmentStatus =
  | "confirmed"
  | "pending"
  | "checked-in"
  | "completed"
  | "cancelled";

export const appointmentStatusMeta: Record<
  AppointmentStatus,
  { label: string; chip: string }
> = {
  confirmed: { label: "Confirmed", chip: "bg-primary/10 text-primary border-primary/20" },
  pending: { label: "Pending", chip: "bg-warning/10 text-warning border-warning/20" },
  "checked-in": { label: "Checked in", chip: "bg-info/12 text-info border-info/25" },
  completed: { label: "Completed", chip: "bg-success/10 text-success border-success/20" },
  cancelled: { label: "Cancelled", chip: "bg-muted text-muted-foreground border-border" },
};
