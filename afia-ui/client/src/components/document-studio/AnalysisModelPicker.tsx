import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getModels, type ModelInfo } from "@/services/openmed-client";
import {
  filterCompatibleModels,
  pickDefaultNerModelId,
  shortModelName,
} from "@/lib/model-platform";
import { getActiveModel, setActiveModel } from "@/services/model-preference";
import { cn } from "@/lib/utils";
import { Boxes, Check, ChevronsUpDown, Loader2 } from "lucide-react";

const MAX_RESULTS = 50;

interface AnalysisModelPickerProps {
  className?: string;
}

export function AnalysisModelPicker({ className }: AnalysisModelPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(() => getActiveModel());
  const [fallbackId, setFallbackId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void getModels()
      .then((catalog) => {
        if (!active) return;
        const compatible = filterCompatibleModels(catalog.ner);
        setModels(compatible);
        setFallbackId(pickDefaultNerModelId(catalog.ner));
        setActiveId(getActiveModel());
      })
      .catch(() => {
        if (active) setModels([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const effectiveId = activeId ?? fallbackId;

  const label = useMemo(() => {
    if (loading) return "Loading models…";
    if (!effectiveId) return "No model";
    const match = models.find((m) => m.id === effectiveId);
    return shortModelName(match?.name || effectiveId);
  }, [effectiveId, loading, models]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return models;
    return models.filter(
      (m) =>
        m.id.toLowerCase().includes(q) ||
        shortModelName(m.name || m.id).toLowerCase().includes(q),
    );
  }, [models, query]);

  const shown = filtered.slice(0, MAX_RESULTS);

  const handleSelect = (model: ModelInfo) => {
    setActiveModel(model.id);
    setActiveId(model.id);
    setOpen(false);
    toast.success("Model set — re-analyze to apply");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label="Analysis model"
          disabled={loading && models.length === 0}
          className={cn(
            "h-7 max-w-[220px] gap-1.5 px-2 text-xs font-normal",
            className,
          )}
        >
          {loading ? (
            <Loader2 className="size-3.5 shrink-0 animate-spin opacity-60" />
          ) : (
            <Boxes className="size-3.5 shrink-0 opacity-60" />
          )}
          <span className="truncate">{label}</span>
          <ChevronsUpDown className="size-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search NER models…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No compatible models found.</CommandEmpty>
            <CommandGroup>
              {shown.map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.id}
                  onSelect={() => handleSelect(model)}
                >
                  <Check
                    className={cn(
                      "size-4 shrink-0",
                      effectiveId === model.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">
                    {shortModelName(model.name || model.id)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            {filtered.length > shown.length && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                Showing {shown.length} of {filtered.length} models
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
