import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DocumentEntity } from "@/services/openmed-client";

const BUCKETS = [
  { key: "below50", label: "<50%", min: 0, max: 0.5, lowTrust: true },
  { key: "50-60", label: "50–60%", min: 0.5, max: 0.6, lowTrust: true },
  { key: "60-70", label: "60–70%", min: 0.6, max: 0.7, lowTrust: true },
  { key: "70-80", label: "70–80%", min: 0.7, max: 0.8, lowTrust: false },
  { key: "80-90", label: "80–90%", min: 0.8, max: 0.9, lowTrust: false },
  { key: "90-100", label: "90–100%", min: 0.9, max: 1.01, lowTrust: false },
] as const;

const chartConfig = {
  count: { label: "Entities", color: "var(--color-chart-2)" },
  low: { label: "Below 70%", color: "var(--color-warning)" },
  high: { label: "70%+", color: "var(--color-chart-2)" },
} satisfies ChartConfig;

export interface ConfidenceHistogramProps {
  entities: DocumentEntity[];
}

export function ConfidenceHistogram({ entities }: ConfidenceHistogramProps) {
  const data = useMemo(() => {
    const counts = BUCKETS.map((bucket) => ({
      ...bucket,
      count: 0,
    }));

    for (const entity of entities) {
      const confidence = entity.confidence ?? 0;
      const bucket =
        counts.find((b) => confidence >= b.min && confidence < b.max) ??
        counts[counts.length - 1];
      bucket.count += 1;
    }

    return counts;
  }, [entities]);

  const total = data.reduce((sum, row) => sum + row.count, 0);
  if (entities.length === 0 || total === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        Confidence distribution
      </p>
      <ChartContainer config={chartConfig} className="h-[220px] w-full">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={10}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={28}
            fontSize={10}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.key}
                fill={
                  entry.lowTrust
                    ? "var(--color-warning)"
                    : "var(--color-chart-2)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
