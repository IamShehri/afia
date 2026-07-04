import { useWorkspace } from "@/contexts/WorkspaceContext";
import { patientById } from "@/data/patients";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, AlertCircle, Zap, Clock, MessageSquare } from "lucide-react";
import { Monogram, RiskBadge, StatusChip, AiTag } from "@/components/primitives";
import { fmtRelative, fmtDateTime } from "@/data/workspace";
import { cn } from "@/lib/utils";

export function Inspector() {
  const { inspector, closeInspector } = useWorkspace();
  const patient = inspector.patientId ? patientById(inspector.patientId) : null;

  if (!inspector.open || !patient) return null;

  return (
    <div className="glass relative w-80 border-l border-hairline flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-hairline p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Monogram name={patient.name} size={28} />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{patient.name}</div>
              <div className="font-mono text-xs text-muted-foreground">
                {patient.id}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <RiskBadge risk={patient.risk} />
            <StatusChip status={patient.status} />
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={closeInspector}
          title="Close inspector (Esc)"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start rounded-none border-b border-hairline bg-transparent px-4 py-0">
          <TabsTrigger value="overview" className="text-xs">
            Overview
          </TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-xs">
            AI
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="flex-1 overflow-y-auto space-y-4 p-4">
          {/* Vitals */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Vitals
            </div>
            <div className="grid grid-cols-2 gap-2">
              {patient.vitals.map((v) => (
                <div
                  key={v.label}
                  className={cn(
                    "rounded-md border p-2",
                    v.state === "alert"
                      ? "border-destructive/30 bg-destructive/5"
                      : v.state === "watch"
                        ? "border-warning/30 bg-warning/5"
                        : "border-border bg-surface",
                  )}
                >
                  <div className="text-[10px] text-muted-foreground">
                    {v.label}
                  </div>
                  <div className="font-mono text-sm font-medium">
                    {v.value}
                    {v.unit && <span className="text-xs ml-0.5">{v.unit}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flags */}
          {patient.flags.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                <AlertCircle className="size-3.5" />
                Flags ({patient.flags.length})
              </div>
              <div className="space-y-2">
                {patient.flags.slice(0, 3).map((f) => (
                  <div
                    key={f.id}
                    className="rounded-md border border-border bg-surface p-2 text-xs"
                  >
                    <div className="font-medium text-foreground">
                      {f.message}
                    </div>
                    <div className="mt-1 text-muted-foreground text-[10px]">
                      {fmtRelative(f.at)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Summary */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
              <AiTag />
            </div>
            <div className="rounded-md border border-ai/20 bg-ai/8 p-2 text-xs leading-relaxed">
              {patient.aiSummary}
            </div>
          </div>
        </TabsContent>

        {/* Timeline */}
        <TabsContent value="timeline" className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {patient.timeline.slice(0, 8).map((e) => (
              <div key={e.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="size-2 rounded-full bg-primary mt-1.5" />
                  <div className="w-px h-8 bg-hairline" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="text-xs font-medium">{e.title}</div>
                  {e.detail && (
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {e.detail}
                    </div>
                  )}
                  <div className="text-[9px] text-muted-foreground/60 mt-1">
                    {fmtDateTime(e.at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* AI Suggestions */}
        <TabsContent value="ai" className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="rounded-md border border-ai/25 bg-ai/10 p-3 space-y-2">
            <div className="flex items-start gap-2">
              <Zap className="size-4 text-ai mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold">Readmission Risk</div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Pattern analysis suggests elevated risk. Review vitals trend.
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-md border border-border bg-surface p-3 space-y-2">
            <div className="flex items-start gap-2">
              <Clock className="size-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold">Care Gap</div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Overdue A1c screening. Order recommended.
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
