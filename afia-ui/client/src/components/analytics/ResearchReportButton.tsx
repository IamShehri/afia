import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface ResearchReportButtonProps {
  disabled?: boolean;
}

export function ResearchReportButton({ disabled }: ResearchReportButtonProps) {
  const handleGenerate = () => {
    window.open("/analytics/report", "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={disabled}
      onClick={handleGenerate}
    >
      <FileText className="size-4" />
      Generate report
    </Button>
  );
}
