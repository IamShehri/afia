/**
 * AFIA primitives — Graphite Atelier
 * Small, composable building blocks shared across modules.
 * Hairlines over boxes; tabular mono numerals for data; accent as signal only.
 */
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/data/types";
import { riskMeta, statusMeta, appointmentStatusMeta } from "@/data/meta";
import type { AppointmentStatus } from "@/data/meta";
import type { PatientStatus } from "@/data/types";

/* Monogram avatar — privacy-safe initials with a per-person hue tint */
export function Monogram({
  name,
  hue,
  size = 28,
  className,
}: {
  name: string;
  hue?: number;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  const h = hue ?? ((name.charCodeAt(0) * 37 + name.length * 13) % 360);
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium select-none",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        color: `oklch(0.86 0.05 ${h})`,
        background: `oklch(0.42 0.07 ${h} / 0.28)`,
        boxShadow: `inset 0 0 0 1px oklch(0.7 0.1 ${h} / 0.22)`,
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export function RiskBadge({
  risk,
  showLabel = true,
  className,
}: {
  risk: RiskLevel;
  showLabel?: boolean;
  className?: string;
}) {
  const m = riskMeta[risk];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        m.chip,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", m.dot)} />
      {showLabel && m.label}
    </span>
  );
}

export function StatusChip({
  status,
  className,
}: {
  status: PatientStatus | AppointmentStatus;
  className?: string;
}) {
  const m = { ...statusMeta, ...appointmentStatusMeta }[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
        m.chip,
        className,
      )}
    >
      {m.label}
    </span>
  );
}

export function Kbd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-[10.5px] font-medium text-muted-foreground",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

/* Standard page header — consistent title + optional subtitle across pages */
export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
}

export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* A faint AI accent label/badge */
export function AiTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-ai/12 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ai",
        className,
      )}
    >
      <span className="size-1 rounded-full bg-ai animate-signal" />
      AFIA
    </span>
  );
}
