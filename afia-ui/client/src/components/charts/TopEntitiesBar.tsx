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
import type { TopEntityRow } from "@/lib/analytics-library";
import { buildEntityLabelColorMap, getEntityLabelColor } from "./entity-chart-colors";

export interface TopEntitiesBarProps {
  rows: TopEntityRow[];
}

export function TopEntitiesBar({ rows }: TopEntitiesBarProps) {
  if (rows.length === 0) {
    return null;
  }

  const labels = useMemo(
    () => [...new Set(rows.map((r) => r.label))],
    [rows],
  );
  const colorMap = useMemo(() => buildEntityLabelColorMap(labels), [labels]);

  const data = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        displayText:
          row.text.length > 36 ? `${row.text.slice(0, 36)}…` : row.text,
        fill: getEntityLabelColor(row.label, colorMap),
      })),
    [rows, colorMap],
  );

  const chartConfig = useMemo(() => {
    const config: ChartConfig = { count: { label: "Occurrences" } };
    for (const label of labels) {
      config[label] = { label, color: colorMap.get(label) };
    }
    return config;
  }, [labels, colorMap]);

  const height = Math.max(220, rows.length * 28);

  return (
    <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" allowDecimals={false} fontSize={10} />
        <YAxis
          type="category"
          dataKey="displayText"
          width={120}
          tickLine={false}
          axisLine={false}
          fontSize={10}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, _name, item) => (
                <span className="font-mono tabular-nums">
                  {item.payload.text} · {item.payload.label} · {value}×
                </span>
              )}
            />
          }
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((entry) => (
            <Cell key={entry.text} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
