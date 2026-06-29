import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Sparkles,
  Activity,
  FlaskConical,
  StickyNote,
  Pill,
  TriangleAlert,
  ChevronRight,
  Heart,
} from "lucide-react";
import { useShell } from "@/stores/shell-store";
import {
  patients,
  timeline,
  aiSuggestions,
  statusLabels,
  type TimelineEvent,
} from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const kindIcon: Record<TimelineEvent["kind"], typeof Activity> = {
  ai: Sparkles,
  lab: FlaskConical,
  note: StickyNote,
  med: Pill,
  alert: TriangleAlert,
};

const kindColor: Record<TimelineEvent["kind"], string> = {
  ai: "text-primary",
  lab: "text-cyan",
  note: "text-muted-foreground",
  med: "text-accent",
  alert: "text-destructive",
};

function Vital({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit: string;
  tone?: "warning" | "destructive" | "success";
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-2.5">
      <p className="text-2xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 flex items-baseline gap-1">
        <span
          className={cn(
            "text-base font-semibold tabular-nums text-foreground",
            tone === "destructive" && "text-destructive",
            tone === "warning" && "text-warning",
            tone === "success" && "text-success",
          )}
        >
          {value}
        </span>
        <span className="text-2xs text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

export function Inspector() {
  const { inspectorOpen, setInspectorOpen, selectedPatientId } = useShell();
  const patient =
    patients.find((p) => p.id === selectedPatientId) ?? patients[1];

  return (
    <AnimatePresence initial={false}>
      {inspectorOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 340, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 38 }}
          className="relative z-10 h-full overflow-hidden border-l border-border bg-canvas"
          aria-label="Inspector"
        >
          <div className="flex h-full w-[340px] flex-col">
            {/* Header */}
            <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3.5">
              <h2 className="text-sm font-semibold text-foreground">Inspector</h2>
              <Badge variant="neutral" className="ml-1">
                {patient.mrn}
              </Badge>
              <Button
                variant="ghost"
                size="icon-xs"
                className="ml-auto"
                onClick={() => setInspectorOpen(false)}
                aria-label="Close inspector"
              >
                <X className="size-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4">
                {/* Patient identity */}
                <div className="flex items-center gap-3">
                  <Avatar className="size-11 ring-1 ring-border">
                    <AvatarFallback className="bg-primary/12 text-sm text-primary">
                      {patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {patient.name}
                    </p>
                    <p className="text-2xs text-muted-foreground">
                      {patient.age} · {patient.sex === "F" ? "Female" : "Male"} ·{" "}
                      {patient.room ?? "Outpatient"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant={
                      patient.status === "critical"
                        ? "destructive"
                        : patient.status === "monitoring"
                          ? "warning"
                          : patient.status === "stable"
                            ? "success"
                            : "neutral"
                    }
                  >
                    {statusLabels[patient.status]}
                  </Badge>
                  <Badge variant="outline">{patient.condition}</Badge>
                </div>

                {/* Risk score */}
                <div className="mt-4 rounded-lg border border-border bg-surface p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-medium text-muted-foreground">
                      AI risk score
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-foreground">
                      {patient.risk}
                      <span className="text-2xs text-muted-foreground">/100</span>
                    </span>
                  </div>
                  <Progress
                    value={patient.risk}
                    className="mt-2"
                    indicatorClassName={
                      patient.risk > 75
                        ? "bg-destructive"
                        : patient.risk > 50
                          ? "bg-warning"
                          : "bg-success"
                    }
                  />
                </div>

                {/* Vitals */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Vital label="Heart rate" value="112" unit="bpm" tone="warning" />
                  <Vital label="Blood pressure" value="148/92" unit="mmHg" tone="destructive" />
                  <Vital label="SpO₂" value="96" unit="%" />
                  <Vital label="Temp" value="37.4" unit="°C" />
                </div>

                {/* Tabs */}
                <Tabs defaultValue="ai" className="mt-4">
                  <TabsList className="w-full">
                    <TabsTrigger value="ai" className="flex-1">
                      <Sparkles className="size-3.5" /> AI
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="flex-1">
                      Timeline
                    </TabsTrigger>
                    <TabsTrigger value="meta" className="flex-1">
                      Details
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="ai" className="space-y-2">
                    {aiSuggestions.map((s) => (
                      <button
                        key={s.id}
                        className="group w-full rounded-lg border border-border bg-surface p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[0.8125rem] font-medium text-foreground">
                            {s.title}
                          </p>
                          <Badge variant="default" className="shrink-0">
                            {s.confidence}%
                          </Badge>
                        </div>
                        <p className="mt-1 text-2xs leading-relaxed text-muted-foreground">
                          {s.detail}
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1 text-2xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                          Apply suggestion
                          <ChevronRight className="size-3" />
                        </span>
                      </button>
                    ))}
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-0">
                    <div className="relative pl-5">
                      <span className="absolute left-[7px] top-1 h-[calc(100%-1rem)] w-px bg-border" />
                      {timeline.map((ev) => {
                        const Icon = kindIcon[ev.kind];
                        return (
                          <div key={ev.id} className="relative pb-4">
                            <span
                              className={cn(
                                "absolute -left-5 flex size-3.5 items-center justify-center rounded-full border border-border bg-surface",
                                kindColor[ev.kind],
                              )}
                            >
                              <Icon className="size-2" />
                            </span>
                            <p className="text-2xs text-muted-foreground">
                              {ev.time}
                            </p>
                            <p className="text-[0.8125rem] font-medium text-foreground">
                              {ev.title}
                            </p>
                            <p className="text-2xs leading-relaxed text-muted-foreground">
                              {ev.detail}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="meta" className="space-y-2.5 text-sm">
                    {[
                      ["MRN", patient.mrn],
                      ["Provider", patient.provider],
                      ["Last seen", patient.lastSeen],
                      ["Location", patient.room ?? "Outpatient"],
                      ["Insurance", "BlueCross · PPO"],
                      ["Allergies", "Penicillin, Sulfa"],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between border-b border-border/60 pb-2"
                      >
                        <span className="text-muted-foreground">{k}</span>
                        <span className="font-medium text-foreground">{v}</span>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>

            {/* Footer actions */}
            <div className="flex shrink-0 items-center gap-2 border-t border-border p-3">
              <Button variant="secondary" size="sm" className="flex-1">
                <Heart className="size-4" /> Add to panel
              </Button>
              <Button size="sm" className="flex-1">
                <Sparkles className="size-4" /> Ask AI
              </Button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
