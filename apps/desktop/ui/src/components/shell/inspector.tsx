import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles, Clock, FileText, Link2, ChevronRight } from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
import { patients, statusMeta, activity } from "@/data/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Sparkline } from "@/components/charts/sparkline";
import { formatRelativeTime } from "@/lib/utils";

export function Inspector() {
  const { inspectorOpen, setInspectorOpen, selectedPatientId } = useWorkspace();
  const patient =
    patients.find((p) => p.id === selectedPatientId) ?? patients[1];

  return (
    <AnimatePresence>
      {inspectorOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 340, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 360, damping: 36 }}
          className="relative z-10 hidden shrink-0 overflow-hidden border-l border-border bg-surface xl:block"
        >
          <div className="flex h-full w-[340px] flex-col">
            <div className="flex h-12 items-center justify-between border-b border-border px-4">
              <span className="text-[13px] font-semibold">Inspector</span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setInspectorOpen(false)}
                aria-label="Close inspector"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Identity */}
              <div className="flex items-center gap-3 px-4 py-4">
                <Avatar name={patient.name} size="lg" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{patient.name}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {patient.age} · {patient.sex} · {patient.mrn}
                  </p>
                </div>
              </div>

              {/* Properties */}
              <div className="grid grid-cols-2 gap-px overflow-hidden border-y border-border bg-border">
                <Prop label="Status">
                  <Badge variant={statusMeta[patient.status].variant}>
                    {statusMeta[patient.status].label}
                  </Badge>
                </Prop>
                <Prop label="Room">
                  <span className="font-medium">{patient.room}</span>
                </Prop>
                <Prop label="Provider">
                  <span className="font-medium">{patient.provider}</span>
                </Prop>
                <Prop label="Risk score">
                  <span className="font-medium tabular-nums">{patient.riskScore}</span>
                </Prop>
              </div>

              {/* Vitals */}
              <Section title="Vitals trend" icon={Clock}>
                <div className="rounded-lg border border-border bg-surface-inset p-3">
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-[12px] text-muted-foreground">Heart rate</span>
                    <span className="font-mono text-sm font-medium">
                      {patient.vitalsTrend.at(-1)} bpm
                    </span>
                  </div>
                  <Sparkline data={patient.vitalsTrend} className="h-12 w-full" />
                </div>
              </Section>

              {/* AI suggestions */}
              <Section title="AFIA suggestions" icon={Sparkles} accent>
                <div className="rounded-lg border border-primary/20 bg-primary/[0.06] p-3">
                  <p className="text-[13px] font-medium text-foreground">
                    Recommend rapid response review
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                    Vitals trending upward over the last 40 minutes. Confidence 92%.
                  </p>
                  <div className="mt-2.5 flex gap-2">
                    <Button size="sm" variant="primary" className="h-7 flex-1">
                      Accept
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7">
                      Dismiss
                    </Button>
                  </div>
                </div>
              </Section>

              {/* Timeline */}
              <Section title="Recent activity" icon={Clock}>
                <ul className="flex flex-col gap-3">
                  {activity.slice(0, 4).map((a) => (
                    <li key={a.id} className="flex gap-2.5">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-border ring-4 ring-surface-inset" />
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium leading-snug">{a.title}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {a.actor} · {formatRelativeTime(new Date(a.time))}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>

              {/* Related */}
              <Section title="Related" icon={Link2}>
                <div className="flex flex-col gap-1">
                  {["Care plan", "Discharge summary", "Imaging — chest CT"].map((r) => (
                    <button
                      key={r}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span className="flex-1 text-left">{r}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              </Section>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function Prop({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface px-4 py-3">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {label}
      </p>
      <div className="text-[13px]">{children}</div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  accent,
  children,
}: {
  title: string;
  icon: import("lucide-react").LucideIcon;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-4">
      <div className="mb-2.5 flex items-center gap-1.5">
        <Icon className={accent ? "h-3.5 w-3.5 text-primary" : "h-3.5 w-3.5 text-muted-foreground"} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}
