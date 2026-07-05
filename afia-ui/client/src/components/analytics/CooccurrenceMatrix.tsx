import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  computeCooccurrenceMatrix,
  getCooccurrencePairDocs,
  type AnalyzedDocSummary,
} from "@/lib/analytics-library";
import { buildEntityLabelColorMap } from "@/components/charts/entity-chart-colors";
import { Grid3x3 } from "lucide-react";

const CHART_HEAT_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
  "var(--color-chart-7)",
  "var(--color-chart-8)",
] as const;

interface CooccurrenceMatrixProps {
  docs: AnalyzedDocSummary[];
}

function heatMix(color: string, intensity: number): string {
  const pct = Math.round(Math.min(1, Math.max(0, intensity)) * 82 + 8);
  return `color-mix(in oklch, ${color} ${pct}%, var(--color-surface))`;
}

export function CooccurrenceMatrixPanel({ docs }: CooccurrenceMatrixProps) {
  const [, setLocation] = useLocation();
  const [topN, setTopN] = useState(12);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(
    null,
  );

  const matrix = useMemo(
    () => computeCooccurrenceMatrix(docs, topN),
    [docs, topN],
  );

  const labelTypes = useMemo(
    () => matrix?.entities.map((entity) => entity.type) ?? [],
    [matrix],
  );
  const colorMap = useMemo(
    () => buildEntityLabelColorMap(labelTypes),
    [labelTypes],
  );

  const maxOffDiagonal = useMemo(() => {
    if (!matrix) return 1;
    let max = 1;
    for (let i = 0; i < matrix.entities.length; i += 1) {
      for (let j = 0; j < matrix.entities.length; j += 1) {
        if (i === j) continue;
        max = Math.max(max, matrix.values[i]?.[j] ?? 0);
      }
    }
    return max;
  }, [matrix]);

  const maxDiagonal = useMemo(() => {
    if (!matrix) return 1;
    return Math.max(
      1,
      ...matrix.entities.map((_, index) => matrix.values[index]?.[index] ?? 0),
    );
  }, [matrix]);

  const docById = useMemo(
    () => new Map(docs.map((doc) => [doc.id, doc])),
    [docs],
  );

  if (!matrix) {
    return (
      <div className="rounded-lg border border-hairline bg-surface px-6 py-10 text-center">
        <Grid3x3 className="mx-auto size-10 text-muted-foreground/60" />
        <p className="mt-4 text-sm font-medium">
          Need at least 2 distinct entities for a co-occurrence matrix
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Analyze more documents or increase your library coverage.
        </p>
      </div>
    );
  }

  const selectedDocs = useMemo(() => {
    if (selected === null || !matrix) return [];
    const rowEntity = matrix.entities[selected.row];
    if (!rowEntity) return [];

    if (selected.row === selected.col) {
      return docs.filter((doc) =>
        doc.entities.some(
          (entity) => entity.text.trim().toLowerCase() === rowEntity.id,
        ),
      );
    }

    return getCooccurrencePairDocs(matrix, selected.row, selected.col)
      .map((id) => docById.get(id))
      .filter((doc): doc is AnalyzedDocSummary => doc !== undefined);
  }, [selected, matrix, docs, docById]);

  const selectedRowEntity =
    selected !== null ? matrix.entities[selected.row] : null;
  const selectedColEntity =
    selected !== null ? matrix.entities[selected.col] : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Label htmlFor="matrix-top-n" className="shrink-0 text-xs">
          Top entities
        </Label>
        <Slider
          id="matrix-top-n"
          className="max-w-xs flex-1"
          min={3}
          max={20}
          step={1}
          value={[topN]}
          onValueChange={([value]) => {
            setTopN(value ?? 12);
            setSelected(null);
          }}
        />
        <span className="w-6 text-sm tabular-nums text-muted-foreground">
          {topN}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-hairline">
        <table className="w-full min-w-[480px] border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-surface p-2 text-left font-medium text-muted-foreground" />
              {matrix.entities.map((entity, col) => (
                <th
                  key={entity.id}
                  className="max-w-[88px] p-2 text-center font-medium"
                  title={entity.label}
                >
                  <span
                    className="line-clamp-2"
                    style={{ color: colorMap.get(entity.type) }}
                  >
                    {entity.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.entities.map((rowEntity, row) => (
              <tr key={rowEntity.id} className="border-t border-hairline">
                <th
                  className="sticky left-0 z-10 max-w-[120px] bg-surface p-2 text-left font-medium"
                  title={rowEntity.label}
                >
                  <span
                    className="line-clamp-2"
                    style={{ color: colorMap.get(rowEntity.type) }}
                  >
                    {rowEntity.label}
                  </span>
                </th>
                {matrix.entities.map((colEntity, col) => {
                  const value = matrix.values[row]?.[col] ?? 0;
                  const isDiagonal = row === col;
                  const isSelected =
                    selected?.row === row && selected?.col === col;
                  const rowColor =
                    CHART_HEAT_COLORS[row % CHART_HEAT_COLORS.length];
                  const intensity = isDiagonal
                    ? value / maxDiagonal
                    : value / maxOffDiagonal;
                  const background =
                    value > 0
                      ? heatMix(
                          isDiagonal ? "var(--color-chart-1)" : rowColor,
                          intensity,
                        )
                      : undefined;

                  return (
                    <td key={`${rowEntity.id}-${colEntity.id}`} className="p-0.5">
                      <button
                        type="button"
                        disabled={value === 0}
                        onClick={() => setSelected({ row, col })}
                        className={cn(
                          "flex h-10 w-full items-center justify-center rounded-sm font-mono tabular-nums transition-colors",
                          value === 0
                            ? "cursor-default text-muted-foreground/40"
                            : "cursor-pointer hover:ring-1 hover:ring-primary/40",
                          isSelected && "ring-2 ring-primary",
                        )}
                        style={{ backgroundColor: background }}
                        title={
                          isDiagonal
                            ? `${rowEntity.label}: ${value} documents`
                            : `${rowEntity.label} + ${colEntity.label}: ${value} co-occurrences`
                        }
                      >
                        {value > 0 ? value : "·"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Diagonal = document frequency · Off-diagonal = co-occurrence count ·
        Click a cell for source documents
      </p>

      {selected !== null && selectedRowEntity && selectedColEntity && (
        <div className="rounded-md border border-hairline bg-surface px-3 py-3 text-sm">
          {selected.row === selected.col ? (
            <>
              <div className="font-medium">{selectedRowEntity.label}</div>
              <p className="mt-1 text-muted-foreground">
                Appears in {matrix.values[selected.row]?.[selected.col] ?? 0}{" "}
                analyzed document
                {(matrix.values[selected.row]?.[selected.col] ?? 0) === 1
                  ? ""
                  : "s"}
              </p>
            </>
          ) : (
            <>
              <div className="font-medium">
                {selectedRowEntity.label}{" "}
                <span className="text-muted-foreground">×</span>{" "}
                {selectedColEntity.label}
              </div>
              <p className="mt-1 text-muted-foreground">
                Co-occur in {matrix.values[selected.row]?.[selected.col] ?? 0}{" "}
                document
                {(matrix.values[selected.row]?.[selected.col] ?? 0) === 1
                  ? ""
                  : "s"}
              </p>
            </>
          )}
          {selectedDocs.length > 0 && (
            <ul className="mt-2 max-h-32 space-y-1 overflow-auto">
              {selectedDocs.map((doc) => (
                <li key={doc.id}>
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setLocation(`/documents?doc=${doc.id}`)}
                  >
                    {doc.filename}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
