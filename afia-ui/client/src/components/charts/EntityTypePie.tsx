import { useMemo } from "react";
import { Cell, Label, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { buildEntityLabelColorMap } from "./entity-chart-colors";

export interface EntityTypePieProps {
  groupedEntities: [string, unknown[]][];
  totalCount: number;
}

export function EntityTypePie({
  groupedEntities,
  totalCount,
}: EntityTypePieProps) {
  const typeCount = groupedEntities.length;
  if (typeCount <= 1 || totalCount === 0) {
    return null;
  }

  const colorMap = useMemo(
    () => buildEntityLabelColorMap(groupedEntities.map(([label]) => label)),
    [groupedEntities],
  );

  const data = useMemo(
    () =>
      groupedEntities.map(([label, list]) => ({
        label,
        count: list.length,
        fill: colorMap.get(label)!,
      })),
    [groupedEntities, colorMap],
  );

  const chartConfig = useMemo(() => {
    const config: ChartConfig = { count: { label: "Entities" } };
    for (const [label] of groupedEntities) {
      config[label] = {
        label,
        color: colorMap.get(label),
      };
    }
    return config;
  }, [groupedEntities, colorMap]);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        By entity type
      </p>
      <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[220px]">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="label" />} />
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            innerRadius={58}
            outerRadius={82}
            paddingAngle={2}
            strokeWidth={1}
          >
            {data.map((entry) => (
              <Cell key={entry.label} fill={entry.fill} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
                  return null;
                }
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) - 6}
                      className="fill-foreground text-2xl font-semibold"
                    >
                      {totalCount}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 14}
                      className="fill-muted-foreground text-[10px]"
                    >
                      entities
                    </tspan>
                  </text>
                );
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
}
