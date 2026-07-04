import { useMemo } from "react";
import { Link } from "wouter";
import { patients } from "@/data/patients";
import { fmtDateTime } from "@/data/workspace";
import { Monogram, RiskBadge, StatusChip, AiTag } from "@/components/primitives";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getKernelTimeline, getKernelSummary } from "@/data/kernel-adapter";

export default function PatientDetail({ id }: { id: string }) {
  const patient = useMemo(() => patients.find((p) => p.id === id), [id]);

  // Kernel-backed projections (query + reasoning layers over lib/).
  const timeline = useMemo(
    () => (patient ? getKernelTimeline(patient) : []),
    [patient],
  );
  const summary = useMemo(
    () => (patient ? getKernelSummary(patient) : null),
    [patient],
  );

  if (!patient) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Patient not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No patient with ID <span className="font-mono">{id}</span>.
        </p>
        <Link href="/patients" className="mt-4 inline-block text-sm text-primary underline">
          Back to patients
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-background">
      {/* Header */}
      <div className="border-b border-hairline px-6 py-4">
        <div className="flex items-center gap-3">
          <Monogram name={patient.name} size={40} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold truncate">{patient.name}</h1>
              <RiskBadge risk={patient.risk} />
              <StatusChip status={patient.status} />
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              {patient.id} · {patient.age}
              {patient.sex} · {patient.condition}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-3">
        {/* Kernel reasoning summary */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Clinical Summary <AiTag />
            </CardTitle>
            <CardDescription>Derived by the AFIA reasoning layer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {summary ? (
              <dl className="grid grid-cols-2 gap-y-2">
                <dt className="text-muted-foreground">Episodes</dt>
                <dd className="font-mono text-right">{summary.totalEpisodes}</dd>
                <dt className="text-muted-foreground">Encounters</dt>
                <dd className="font-mono text-right">{summary.totalEncounters}</dd>
                <dt className="text-muted-foreground">Events</dt>
                <dd className="font-mono text-right">{summary.totalEvents}</dd>
                <dt className="text-muted-foreground">Active episodes</dt>
                <dd className="font-mono text-right">{summary.activeEpisodes}</dd>
                <dt className="text-muted-foreground">Active encounters</dt>
                <dd className="font-mono text-right">{summary.activeEncounters}</dd>
              </dl>
            ) : (
              <p className="text-muted-foreground">No summary available.</p>
            )}
          </CardContent>
        </Card>

        {/* Kernel-reconstructed timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>
              Reconstructed by the AFIA query layer ({timeline.length} events)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">No timeline events.</p>
            ) : (
              <ol className="relative space-y-4 border-l border-hairline pl-4">
                {timeline.map((event) => (
                  <li key={event.id} className="relative">
                    <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-primary/70" />
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-medium">{event.title}</span>
                      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                        {fmtDateTime(event.at)}
                      </span>
                    </div>
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground/70">
                      {event.type}
                    </div>
                    {event.detail && (
                      <p className="mt-1 text-sm text-muted-foreground">{event.detail}</p>
                    )}
                    {event.author && (
                      <p className="mt-0.5 text-xs text-muted-foreground/70">— {event.author}</p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
