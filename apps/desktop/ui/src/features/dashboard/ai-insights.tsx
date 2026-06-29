import { Check, Clock, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { aiSuggestions, schedule } from "@/lib/mock-data";

function confidenceTone(c: number) {
  if (c >= 85) return "text-success";
  if (c >= 70) return "text-cyan";
  return "text-warning";
}

export function AiInsights() {
  return (
    <Card className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"
        aria-hidden
      />
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-accent/15 text-accent">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <CardTitle>AI recommendations</CardTitle>
            <CardDescription>Suggested clinical actions</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {aiSuggestions.map((s) => (
          <div
            key={s.id}
            className="group rounded-lg border border-border/60 bg-muted/30 p-3 transition-colors hover:border-accent/40 hover:bg-muted/50"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{s.title}</p>
              <span className={cn("shrink-0 text-xs font-semibold tabular-nums", confidenceTone(s.confidence))}>
                {s.confidence}%
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.detail}</p>
            <div className="mt-2.5 flex items-center gap-2">
              <Button size="sm" className="h-7 gap-1 px-2.5 text-xs">
                <Check className="h-3.5 w-3.5" /> Accept
              </Button>
              <Button size="sm" variant="ghost" className="h-7 gap-1 px-2.5 text-xs text-muted-foreground">
                <X className="h-3.5 w-3.5" /> Dismiss
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const scheduleTone = {
  "in-progress": "bg-accent/15 text-accent border-accent/20",
  upcoming: "bg-muted text-muted-foreground border-border",
  done: "bg-success/10 text-success border-success/20",
} as const;

export function ScheduleCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary">
            <Clock className="h-4 w-4" />
          </span>
          <div>
            <CardTitle>Today&apos;s schedule</CardTitle>
            <CardDescription>4 appointments</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {schedule.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50">
            <span className="w-12 shrink-0 text-sm font-medium tabular-nums text-muted-foreground">{item.time}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{item.patient}</p>
              <p className="truncate text-xs text-muted-foreground">{item.type}</p>
            </div>
            <Badge variant="outline" className={cn("shrink-0 capitalize", scheduleTone[item.status])}>
              {item.status.replace("-", " ")}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
