import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionLabel } from "@/components/primitives";
import {
  compareDocuments,
  type AnalyzedDocSummary,
} from "@/lib/analytics-library";
import { buildEntityLabelColorMap, getEntityLabelColor } from "@/components/charts/entity-chart-colors";

export interface DocumentComparisonProps {
  docs: AnalyzedDocSummary[];
  docAId: string;
  docBId: string;
  onDocAChange: (id: string) => void;
  onDocBChange: (id: string) => void;
}

function EntityColumn({
  title,
  entities,
  colorMap,
  emptyMessage,
}: {
  title: string;
  entities: { text: string; label: string }[];
  colorMap: Map<string, string>;
  emptyMessage: string;
}) {
  return (
    <div className="min-h-[120px] rounded-md border border-hairline bg-surface p-3">
      <div className="mb-2 text-xs font-medium text-muted-foreground">
        {title}{" "}
        <span className="font-mono text-foreground/70">({entities.length})</span>
      </div>
      {entities.length === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="flex max-h-64 flex-wrap gap-1.5 overflow-y-auto">
          {entities.map((entity) => (
            <span
              key={`${title}-${entity.text}`}
              className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-hairline bg-surface px-2 py-1 text-[11px]"
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{
                  backgroundColor: getEntityLabelColor(entity.label, colorMap),
                }}
              />
              <span className="truncate">{entity.text}</span>
              <span className="shrink-0 rounded border border-ai/25 bg-ai/10 px-1 font-mono text-[10px] text-ai">
                {entity.label}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function DocumentComparisonPanel({
  docs,
  docAId,
  docBId,
  onDocAChange,
  onDocBChange,
}: DocumentComparisonProps) {
  const docA = docs.find((d) => d.id === docAId);
  const docB = docs.find((d) => d.id === docBId);

  const comparison = useMemo(() => {
    if (!docA || !docB || docA.id === docB.id) {
      return { shared: [], onlyA: [], onlyB: [] };
    }
    return compareDocuments(docA, docB);
  }, [docA, docB]);

  const colorMap = useMemo(() => {
    const labels = new Set<string>();
    for (const list of [
      comparison.shared,
      comparison.onlyA,
      comparison.onlyB,
    ]) {
      for (const e of list) labels.add(e.label);
    }
    return buildEntityLabelColorMap([...labels]);
  }, [comparison]);

  if (docs.length < 2) {
    return null;
  }

  return (
    <div className="space-y-3">
      <SectionLabel>Document comparison</SectionLabel>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select value={docAId} onValueChange={onDocAChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select document A" />
          </SelectTrigger>
          <SelectContent>
            {docs.map((doc) => (
              <SelectItem key={doc.id} value={doc.id}>
                {doc.filename}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={docBId} onValueChange={onDocBChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select document B" />
          </SelectTrigger>
          <SelectContent>
            {docs.map((doc) => (
              <SelectItem key={doc.id} value={doc.id}>
                {doc.filename}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {docA && docB && docA.id !== docB.id ? (
        <div className="grid gap-3 lg:grid-cols-3">
          <EntityColumn
            title="Shared"
            entities={comparison.shared}
            colorMap={colorMap}
            emptyMessage="No shared entity texts."
          />
          <EntityColumn
            title={`Only in ${docA.filename}`}
            entities={comparison.onlyA}
            colorMap={colorMap}
            emptyMessage="No unique entities."
          />
          <EntityColumn
            title={`Only in ${docB.filename}`}
            entities={comparison.onlyB}
            colorMap={colorMap}
            emptyMessage="No unique entities."
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Select two different documents to compare.
        </p>
      )}
    </div>
  );
}
