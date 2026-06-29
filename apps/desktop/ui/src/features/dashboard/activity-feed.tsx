import { AlertTriangle, FileText, FlaskConical, Pill, Sparkles } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { timeline, type TimelineEvent } from "@/lib/mock-data";

const kindMeta: Record<TimelineEvent["kind"], { icon: typeof Sparkles; tone: string }> = {
  ai: { icon: Sparkles, tone: "bg-accent/15 text-accent" },
  alert: { icon: AlertTriangle, tone: "bg-destructive/15 text-destructive" },
  med: { icon: Pill, tone: "bg-cyan/15 text-cyan" },
  note: { icon: FileText, tone: "bg-muted text-muted-foreground" },
  lab: { icon: FlaskConical, tone: "bg-success/15 text-success" },
};

export function ActivityFeed() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>Real-time clinical events</CardDescription>
      </CardHeader>
      <div className="px-4 pb-4">
        <ScrollArea className="h-[300px] pr-2">
          <ol className="relative space-y-1 pl-1">
            {timeline.map((event, i) => {
              const meta = kindMeta[event.kind];
              const Icon = meta.icon;
              return (
                <li key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < timeline.length - 1 && (
                    <span className="absolute left-[15px] top-8 h-full w-px bg-border" aria-hidden />
                  )}
                  <span className={cn("z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full", meta.tone)}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{event.title}</p>
                      <time className="shrink-0 text-xs tabular-nums text-muted-foreground">{event.time}</time>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">{event.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </ScrollArea>
      </div>
    </Card>
  );
}
