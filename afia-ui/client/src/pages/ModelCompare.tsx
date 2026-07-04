import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { PageHeader, SectionLabel } from "@/components/primitives";
import { cn } from "@/lib/utils";
import {
  getModels,
  analyzeText,
  type ModelInfo,
  type AnalyzeResult,
} from "@/services/openmed-client";
import {
  Boxes,
  GitCompare,
  Loader2,
  AlertCircle,
  Check,
  ChevronsUpDown,
  Plus,
  X,
} from "lucide-react";

const SAMPLE =
  "Patient presented with chest pain, fever, and was prescribed amoxicillin 500mg for suspected pneumonia.";

/* Strip the "OpenMed/" (or any org) prefix for a cleaner display name. */
function cleanName(name: string): string {
  return name.replace(/^OpenMed\//i, "").replace(/^.*\//, "");
}

const MAX_RESULTS = 50;

/* Searchable model picker — self-filters (case-insensitive, id + name),
   caps rendered results, and keeps its own state so A/B stay independent. */
function ModelCombobox({
  models,
  value,
  onChange,
  placeholder,
}: {
  models: ModelInfo[];
  value: string | null;
  onChange: (id: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = models.find((m) => m.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return models;
    return models.filter(
      (m) =>
        m.id.toLowerCase().includes(q) ||
        cleanName(m.name || m.id).toLowerCase().includes(q),
    );
  }, [models, query]);

  const shown = filtered.slice(0, MAX_RESULTS);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="mt-2 w-full justify-between font-normal"
        >
          <span className="truncate">
            {selected ? cleanName(selected.name || selected.id) : placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search models…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No models found.</CommandEmpty>
            <CommandGroup>
              {shown.map((m) => (
                <CommandItem
                  key={m.id}
                  value={m.id}
                  onSelect={() => {
                    onChange(m.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "size-4",
                      value === m.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">{cleanName(m.name || m.id)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            {filtered.length > shown.length && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                Showing {shown.length} of {filtered.length} results
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function ResultColumn({
  result,
  comparing,
  error,
  otherTexts,
  uniqueLabel,
}: {
  result: AnalyzeResult | null;
  comparing: boolean;
  error: string | null;
  otherTexts: Set<string>;
  uniqueLabel: string;
}) {
  if (comparing) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Analyzing…
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold">
            {cleanName(result.model)}
          </span>
          <span className="shrink-0 font-mono text-xs text-muted-foreground">
            {result.processing_time.toFixed(2)}s
          </span>
        </div>

        <div className="text-sm text-muted-foreground">
          Entities Found:{" "}
          <span className="font-mono font-medium text-foreground">
            {result.entities.length}
          </span>
        </div>

        {result.entities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No entities detected.</p>
        ) : (
          <div className="space-y-1.5">
            {result.entities.map((e, i) => {
              const isUnique = !otherTexts.has(e.text.toLowerCase());
              return (
                <div
                  key={`${e.start}-${e.end}-${i}`}
                  className="flex items-center gap-2 rounded-md border border-hairline bg-surface px-2.5 py-1.5"
                >
                  <span className="rounded border border-ai/25 bg-ai/10 px-1.5 py-0.5 text-[11px] font-medium text-ai">
                    {e.label}
                  </span>
                  <span className="flex-1 truncate text-sm">{e.text}</span>
                  {isUnique && (
                    <span className="shrink-0 rounded border border-warning/25 bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                      {uniqueLabel}
                    </span>
                  )}
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {(e.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const MIN_MODELS = 2;
const MAX_MODELS = 6;

export default function ModelCompare() {
  const [text, setText] = useState(SAMPLE);
  const [selectedModels, setSelectedModels] = useState<(string | null)[]>([
    null,
    null,
  ]);
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [results, setResults] = useState<(AnalyzeResult | null)[]>([null, null]);
  const [errors, setErrors] = useState<(string | null)[]>([null, null]);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getModels()
      .then((data) => {
        if (!active) return;
        setAvailableModels([
          ...data.ner,
          ...data.pii,
          ...data.zeroshot,
          ...data.other,
        ]);
      })
      .catch((e) => {
        if (active)
          setError(e instanceof Error ? e.message : "Failed to fetch models");
      });
    return () => {
      active = false;
    };
  }, []);

  const setModelAt = (index: number, id: string) => {
    setSelectedModels((prev) =>
      prev.map((m, i) => (i === index ? id : m)),
    );
  };

  const addModel = () => {
    if (selectedModels.length >= MAX_MODELS) return;
    setSelectedModels((prev) => [...prev, null]);
    setResults((prev) => [...prev, null]);
    setErrors((prev) => [...prev, null]);
  };

  const removeModel = (index: number) => {
    if (selectedModels.length <= MIN_MODELS) return;
    setSelectedModels((prev) => prev.filter((_, i) => i !== index));
    setResults((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const selectedCount = selectedModels.filter(Boolean).length;
  const hasResults =
    results.some((r) => r !== null) || errors.some((e) => e !== null);
  const canCompare =
    text.trim().length > 0 && selectedCount >= MIN_MODELS && !comparing;

  const handleCompare = async () => {
    if (text.trim().length === 0) return;
    const chosen = selectedModels
      .map((id, index) => ({ id, index }))
      .filter((x): x is { id: string; index: number } => !!x.id);
    if (chosen.length < MIN_MODELS) {
      setError("Select at least 2 models to compare.");
      return;
    }
    setComparing(true);
    setError(null);
    setResults(selectedModels.map(() => null));
    setErrors(selectedModels.map(() => null));

    const settled = await Promise.allSettled(
      chosen.map((c) => analyzeText(text, c.id)),
    );

    const nextResults: (AnalyzeResult | null)[] = selectedModels.map(() => null);
    const nextErrors: (string | null)[] = selectedModels.map(() => null);
    settled.forEach((s, i) => {
      const idx = chosen[i].index;
      if (s.status === "fulfilled") {
        nextResults[idx] = s.value;
      } else {
        nextErrors[idx] =
          s.reason instanceof Error ? s.reason.message : "Failed";
      }
    });
    setResults(nextResults);
    setErrors(nextErrors);
    setComparing(false);
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <PageHeader
          title="Model Comparison"
          subtitle="Run multiple models on the same text and compare results"
        />

        <Card>
          <CardContent className="space-y-4">
            <div>
              <SectionLabel>Clinical text</SectionLabel>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste clinical text to analyze…"
                className="mt-2 min-h-32 font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {selectedModels.map((val, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between">
                    <SectionLabel>
                      Model {String.fromCharCode(65 + index)}
                    </SectionLabel>
                    <button
                      type="button"
                      onClick={() => removeModel(index)}
                      disabled={selectedModels.length <= MIN_MODELS}
                      aria-label={`Remove model ${String.fromCharCode(65 + index)}`}
                      className="text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <ModelCombobox
                    models={availableModels}
                    value={val}
                    onChange={(id) => setModelAt(index, id)}
                    placeholder="Select a model…"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={addModel}
                disabled={selectedModels.length >= MAX_MODELS}
              >
                <Plus className="size-4" />
                Add Model
              </Button>
              {selectedModels.length >= MAX_MODELS && (
                <span className="text-xs text-muted-foreground">
                  Maximum 6 models
                </span>
              )}
            </div>

            <Button className="w-full" onClick={handleCompare} disabled={!canCompare}>
              {comparing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <GitCompare className="size-4" />
              )}
              Compare
            </Button>
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {comparing ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {selectedModels.map((id, index) =>
              id ? (
                <ResultColumn
                  key={index}
                  result={null}
                  comparing
                  error={null}
                  otherTexts={new Set()}
                  uniqueLabel="Unique"
                />
              ) : null,
            )}
          </div>
        ) : hasResults ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r, index) => {
              const otherTexts = new Set<string>();
              results.forEach((other, j) => {
                if (j === index) return;
                for (const e of other?.entities ?? []) {
                  otherTexts.add(e.text.toLowerCase());
                }
              });
              return (
                <ResultColumn
                  key={index}
                  result={r}
                  comparing={false}
                  error={errors[index]}
                  otherTexts={otherTexts}
                  uniqueLabel="Unique"
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-hairline bg-surface px-6 py-16 text-center">
            <Boxes className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Select at least two models and run a comparison to see results side
              by side
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
