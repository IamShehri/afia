import { useMemo, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import type { DocumentEntity } from "@/services/openmed-client";
import { ChevronDown, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EntityTypePie } from "./EntityTypePie";
import { ConfidenceHistogram } from "./ConfidenceHistogram";
import { EntityTimeline } from "./EntityTimeline";

export interface DocumentInsightsProps {
  entities: DocumentEntity[];
  groupedEntities: [string, DocumentEntity[]][];
  entityCount: number;
  pageCount: number;
  documentLength: number;
}

export function DocumentInsights({
  entities,
  groupedEntities,
  entityCount,
  pageCount,
  documentLength,
}: DocumentInsightsProps) {
  const showPie = groupedEntities.length > 1 && entityCount > 0;
  const showHistogram = entities.length > 0;
  const showTimeline =
    entities.length > 5 && pageCount > 1 && documentLength > 0;

  const hasCharts = showPie || showHistogram || showTimeline;
  const defaultOpen = entityCount >= 3;
  const [open, setOpen] = useState(defaultOpen);

  const chartCount = useMemo(
    () => [showPie, showHistogram, showTimeline].filter(Boolean).length,
    [showPie, showHistogram, showTimeline],
  );

  if (!hasCharts) {
    return null;
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="group -ml-2 mt-4 flex h-8 w-full justify-between px-2"
        >
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <BarChart3 className="size-3.5" />
            Insights
            <span className="font-normal">
              ({chartCount} chart{chartCount === 1 ? "" : "s"})
            </span>
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div
          className={cn(
            "mt-3 grid gap-6",
            chartCount >= 2 ? "md:grid-cols-2" : "grid-cols-1",
          )}
        >
          {showPie && (
            <EntityTypePie
              groupedEntities={groupedEntities}
              totalCount={entityCount}
            />
          )}
          {showHistogram && <ConfidenceHistogram entities={entities} />}
          {showTimeline && (
            <EntityTimeline
              entities={entities}
              documentLength={documentLength}
              pageCount={pageCount}
            />
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
