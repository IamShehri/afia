import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/primitives";
import { cn } from "@/lib/utils";
import {
  getModels,
  type ModelInfo,
} from "@/services/openmed-client";
import {
  getActiveModel,
  setActiveModel,
} from "@/services/model-preference";
import { Sparkles, Search, AlertCircle, X, Check } from "lucide-react";

type Category = "ner" | "pii" | "zeroshot" | "other";

type ModelCatalog = Record<Category, ModelInfo[]>;

const TABS: { id: Category; label: string }[] = [
  { id: "ner", label: "NER Models" },
  { id: "pii", label: "PII Detection" },
  { id: "zeroshot", label: "Zero-Shot" },
  { id: "other", label: "Other" },
];

/* Strip the "OpenMed/" (or any org) prefix for a cleaner display name. */
function cleanName(name: string): string {
  return name.replace(/^OpenMed\//i, "").replace(/^.*\//, "");
}

/* Parse a parameter size like "108M" or "1.6B" from the model name. */
function parseSize(name: string): string | null {
  const match = name.match(/(\d+(?:\.\d+)?)\s*([MB])\b/);
  return match ? `${match[1]}${match[2]}` : null;
}

function ModelCard({
  model,
  isActive,
  onSelect,
}: {
  model: ModelInfo;
  isActive: boolean;
  onSelect: () => void;
}) {
  const display = cleanName(model.name || model.id);
  const size = parseSize(model.id) ?? parseSize(model.name);
  const isMlx = /mlx/i.test(model.id) || /mlx/i.test(model.name);

  return (
    <Card
      className={cn(
        "transition-shadow hover:shadow-md",
        isActive && "border-primary",
      )}
    >
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium leading-snug break-all">
            {display}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {size && (
            <span className="rounded border border-ai/25 bg-ai/10 px-1.5 py-0.5 font-mono text-[11px] font-medium text-ai">
              {size}
            </span>
          )}
          {isMlx && (
            <span className="rounded border border-hairline bg-elevated px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              MLX
            </span>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="truncate font-mono text-[11px] text-muted-foreground">
            {model.id}
          </span>
          {isActive ? (
            <Button size="sm" variant="outline" disabled>
              <Check className="size-4" />
              Active
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={onSelect}>
              Select
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-28 animate-pulse rounded-xl border border-hairline bg-elevated"
        />
      ))}
    </div>
  );
}

export default function Models() {
  const [models, setModels] = useState<ModelCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>("ner");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBanner, setShowBanner] = useState(true);
  const [activeModel, setActiveModelState] = useState<string | null>(null);

  useEffect(() => {
    setActiveModelState(getActiveModel());
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getModels()
      .then((data) => {
        if (active) {
          setModels(data);
          setError(null);
        }
      })
      .catch((e) => {
        if (active) {
          setError(e instanceof Error ? e.message : "Failed to fetch models");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo<Record<Category, number>>(
    () => ({
      ner: models?.ner.length ?? 0,
      pii: models?.pii.length ?? 0,
      zeroshot: models?.zeroshot.length ?? 0,
      other: models?.other.length ?? 0,
    }),
    [models],
  );

  const filtered = useMemo(() => {
    const list = models?.[activeCategory] ?? [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (m) =>
        m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q),
    );
  }, [models, activeCategory, searchQuery]);

  const activeModelName = useMemo(() => {
    if (!activeModel || !models) return null;
    for (const cat of Object.values(models)) {
      const found = cat.find((m) => m.id === activeModel);
      if (found) return cleanName(found.name || found.id);
    }
    return cleanName(activeModel);
  }, [activeModel, models]);

  const handleSelect = (model: ModelInfo) => {
    setActiveModel(model.id);
    setActiveModelState(model.id);
    toast.success(`Active model: ${cleanName(model.name || model.id)}`);
  };

  const handleResetModel = () => {
    setActiveModel(null);
    setActiveModelState(null);
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <PageHeader
          title="Model Library"
          subtitle="Browse and select OpenMed models for your analysis"
        />

        {showBanner && (
          <div className="flex items-start gap-2 rounded-lg border border-ai/25 bg-ai/10 p-3 text-sm">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-ai" />
            <span className="flex-1 text-foreground">
              BioMistral and MedGemma integration coming soon — currently
              showing OpenMed's full model catalog
            </span>
            <button
              type="button"
              onClick={() => setShowBanner(false)}
              aria-label="Dismiss"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {activeModel && (
          <div className="flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/5 p-3 text-sm">
            <Check className="size-4 shrink-0 text-primary" />
            <span className="flex-1">
              Active model:{" "}
              <span className="font-medium">
                {activeModelName ?? activeModel}
              </span>
            </span>
            <Button size="sm" variant="outline" onClick={handleResetModel}>
              Reset to default
            </Button>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>
              Couldn't reach the OpenMed bridge at{" "}
              <span className="font-mono">127.0.0.1:8765</span>. Start the bridge
              service and reload.
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-hairline">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveCategory(t.id)}
              className={cn(
                "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                activeCategory === t.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label} ({counts[t.id]})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search models…"
            className="pl-8"
          />
        </div>

        {/* Content */}
        {loading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {error
              ? "No models to show."
              : searchQuery
                ? "No models match your search."
                : "No models in this category."}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <ModelCard
                key={m.id}
                model={m}
                isActive={m.id === activeModel}
                onSelect={() => handleSelect(m)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
