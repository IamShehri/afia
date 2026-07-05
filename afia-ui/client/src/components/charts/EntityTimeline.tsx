import { useMemo } from "react";
import { Scatter, ScatterChart, XAxis, YAxis, ZAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DocumentEntity } from "@/services/openmed-client";
import { buildEntityLabelColorMap, getEntityLabelColor } from "./entity-chart-colors";

export interface EntityTimelineProps {
  entities: DocumentEntity[];
  documentLength: number;
  pageCount: number;
}

export function EntityTimeline({
  entities,
  documentLength,
  pageCount,
}: EntityTimelineProps) {
  if (
    entities.length <= 5 ||
    pageCount <= 1 ||
    documentLength <= 0
  ) {
    return null;
  }

  const labels = useMemo(
    () => [...new Set(entities.map((e) => e.label))].sort(),
    [entities],
  );
  const colorMap = useMemo(() => buildEntityLabelColorMap(labels), [labels]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      position: { label: "% through document" },
    };
    for (const label of labels) {
      config[label] = {
        label,
        color: colorMap.get(label),
      };
    }
    return config;
  }, [labels, colorMap]);

  const data = useMemo(
    () =>
      entities.map((entity, index) => {
        const midpoint = (entity.start + entity.end) / 2;
        const percent = Math.min(
          100,
          Math.max(0, (midpoint / documentLength) * 100),
        );
        const lane = labels.indexOf(entity.label);
        return {
          id: index,
          label: entity.label,
          lane,
          laneLabel: entity.label,
          position: Math.round(percent * 10) / 10,
          confidence: Math.round(entity.confidence * 100),
          fill: getEntityLabelColor(entity.label, colorMap),
        };
      }),
    [entities, documentLength, labels, colorMap],
  );

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        Position in document
      </p>
      <ChartContainer config={chartConfig} className="h-[220px] w-full">
        <ScatterChart margin={{ top: 8, right: 12, left: 4, bottom: 16 }}>
          <XAxis
            type="number"
            dataKey="position"
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={10}
            tickFormatter={(v) => `${v}%`}
            label={{
              value: "% through document",
              position: "insideBottom",
              offset: -2,
              fontSize: 10,
              fill: "var(--color-muted-foreground)",
            }}
          />
          <YAxis
            type="number"
            dataKey="lane"
            domain={[-0.5, labels.length - 0.5]}
            ticks={labels.map((_, i) => i)}
            tickFormatter={(value) => labels[value] ?? ""}
            tickLine={false}
            axisLine={false}
            width={72}
            fontSize={9}
          />
          <ZAxis type="number" dataKey="confidence" range={[40, 120]} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, _name, item) => (
                  <span className="font-mono tabular-nums">
                    {item.payload.label} · {item.payload.position}% ·{" "}
                    {item.payload.confidence}%
                  </span>
                )}
              />
            }
          />
          <Scatter
            data={data}
            shape={(props: { cx?: number; cy?: number; payload?: { fill?: string } }) => {
              const cx = props.cx ?? 0;
              const cy = props.cy ?? 0;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={5}
                  fill={props.payload?.fill ?? "var(--color-chart-2)"}
                  fillOpacity={0.85}
                />
              );
            }}
          />
        </ScatterChart>
      </ChartContainer>
    </div>
  );
}
