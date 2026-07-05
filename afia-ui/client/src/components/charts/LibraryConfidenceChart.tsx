import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DocumentConfidenceRow } from "@/lib/analytics-library";

const chartConfig = {
  avgConfidence: { label: "Avg confidence", color: "var(--color-chart-2)" },
  low: { label: "Below 70%", color: "var(--color-warning)" },
} satisfies ChartConfig;

export interface LibraryConfidenceChartProps {
  rows: DocumentConfidenceRow[];
}

export function LibraryConfidenceChart({ rows }: LibraryConfidenceChartProps) {
  if (rows.length === 0) {
    return null;
  }

  const data = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        displayName:
          row.filename.length > 28
            ? `${row.filename.slice(0, 28)}…`
            : row.filename,
        avgPercent: Math.round(row.avgConfidence * 1000) / 10,
        lowTrust: row.avgConfidence < 0.7,
      })),
    [rows],
  );

  const height = Math.max(220, rows.length * 32);

  return (
    <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          fontSize={10}
        />
        <YAxis
          type="category"
          dataKey="displayName"
          width={130}
          tickLine={false}
          axisLine={false}
          fontSize={10}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, _name, item) => (
                <span className="font-mono tabular-nums">
                  {item.payload.filename} · {value}%
                </span>
              )}
            />
          }
        />
        <Bar dataKey="avgPercent" radius={[0, 4, 4, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.id}
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
  );
}
