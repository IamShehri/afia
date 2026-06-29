import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { stats, type Stat } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const chartData = data.map((v, i) => ({ i, v }));
  const stroke = positive ? "hsl(var(--success))" : "hsl(var(--destructive))";
  const id = `spark-${positive ? "up" : "down"}`;
  return (
    <div className="h-9 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={stroke}
            strokeWidth={1.75}
            fill={`url(#${id})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatCard({ stat }: { stat: Stat }) {
  const Arrow = stat.trend === "up" ? ArrowUpRight : ArrowDownRight;
  return (
    <Card className="group p-4 transition-colors hover:border-border-strong">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xs font-medium text-muted-foreground">
            {stat.label}
          </p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
            {stat.value}
          </p>
        </div>
        <Sparkline data={stat.series} positive={stat.positive} />
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-2xs font-semibold",
            stat.positive
              ? "bg-success/12 text-success"
              : "bg-destructive/12 text-destructive",
          )}
        >
          <Arrow className="size-3" />
          {stat.delta}%
        </span>
        <span className="text-2xs text-muted-foreground">vs last week</span>
      </div>
    </Card>
  );
}

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.id} stat={s} />
      ))}
    </div>
  );
}
