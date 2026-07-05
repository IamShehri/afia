import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FhirExportResult } from "@/services/openmed-client";
import { ChevronDown, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FhirExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: FhirExportResult | null;
  loading: boolean;
  error: string | null;
  onDownload: () => void;
}

function formatSummaryChips(summary: FhirExportResult["summary"]): string {
  const parts: string[] = [];
  const created = summary.resources_created ?? {};
  for (const [type, count] of Object.entries(created)) {
    if (count > 0) {
      parts.push(`${count} ${type}${count === 1 ? "" : "s"}`);
    }
  }
  if (summary.entities_skipped_pii > 0) {
    parts.push(
      `${summary.entities_skipped_pii} skipped (PII)`,
    );
  }
  return parts.join(" · ") || "No clinical resources emitted";
}

export function FhirExportModal({
  open,
  onOpenChange,
  result,
  loading,
  error,
  onDownload,
}: FhirExportModalProps) {
  const jsonPreview = result
    ? JSON.stringify(result.bundle, null, 2)
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-4 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>FHIR R4 Bundle (draft)</DialogTitle>
        </DialogHeader>

        <div className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-foreground">
          Draft output for review — not validated for clinical or billing use.
          Requires professional review before any operational use.
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Building FHIR bundle…
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {result && !loading && (
          <>
            <p className="text-sm text-muted-foreground">
              {formatSummaryChips(result.summary)}
            </p>

            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="group w-full justify-between px-2"
                >
                  <span className="text-sm font-medium">JSON preview</span>
                  <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <pre
                  className={cn(
                    "mt-2 max-h-80 overflow-auto rounded-md border border-hairline",
                    "bg-surface p-3 font-mono text-[11px] leading-relaxed",
                  )}
                >
                  {jsonPreview}
                </pre>
              </CollapsibleContent>
            </Collapsible>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            disabled={!result || loading}
            onClick={onDownload}
          >
            <Download className="size-4" />
            Download JSON
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
