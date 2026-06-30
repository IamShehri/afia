import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/charts/sparkline";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  delta: number;
  icon: LucideIcon;
  trend: number[];
  positiveIsGood?: boolean;
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  trend,
  positiveIsGood = true,
}: StatCardProps) {
  const up = delta >= 0;
  const good = positiveIsGood ? up : !up;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
            good ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
          )}
        >
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(delta)}%
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">{label}</p>
        </div>
        <Sparkline
          data={trend}
          className="h-9 w-20"
          color={good ? "hsl(var(--success))" : "hsl(var(--destructive))"}
        />
      </div>
    </Card>
  );
}
