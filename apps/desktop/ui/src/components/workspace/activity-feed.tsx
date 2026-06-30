import {
  Sparkles,
  FlaskConical,
  ClipboardList,
  FileText,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { activity, type ActivityItem } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const kindMeta: Record<
  ActivityItem["kind"],
  { icon: LucideIcon; className: string }
> = {
  ai: { icon: Sparkles, className: "bg-primary/10 text-primary" },
  lab: { icon: FlaskConical, className: "bg-accent/10 text-accent" },
  order: { icon: ClipboardList, className: "bg-secondary text-muted-foreground" },
  note: { icon: FileText, className: "bg-secondary text-muted-foreground" },
  admit: { icon: UserPlus, className: "bg-success/10 text-success" },
};

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative flex flex-col gap-4 before:absolute before:left-[15px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
          {activity.map((a) => {
            const meta = kindMeta[a.kind];
            const Icon = meta.icon;
            return (
              <li key={a.id} className="relative flex gap-3">
                <span
                  className={cn(
                    "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-card",
                    meta.className,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[13px] font-medium leading-snug text-foreground">
                    {a.title}
                  </p>
                  <p className="truncate text-[12px] text-muted-foreground">{a.detail}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                    {a.actor} · {formatRelativeTime(new Date(a.time))}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
