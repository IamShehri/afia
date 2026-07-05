import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { exportResearchZip } from "@/lib/research-export";
import type { AnalyzedDocSummary } from "@/lib/analytics-library";
import { Archive, Loader2 } from "lucide-react";

interface ResearchDataExportButtonProps {
  docs: AnalyzedDocSummary[];
}

export function ResearchDataExportButton({ docs }: ResearchDataExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportResearchZip(docs);
      toast.success("Research export downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={exporting || docs.length === 0}
      onClick={() => void handleExport()}
    >
      {exporting ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Archive className="size-4" />
      )}
      Export for analysis
    </Button>
  );
}
