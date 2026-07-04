import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/primitives";
import { ChevronLeft, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterConfig {
  title: string;
  options: string[];
}

function getFilterConfig(location: string): FilterConfig | null {
  if (location === "/patients" || location.startsWith("/patients/")) {
    return { title: "Risk Level", options: ["All", "High", "Medium", "Low"] };
  }
  if (location === "/schedule") {
    return { title: "Status", options: ["All", "Active", "Pending"] };
  }
  if (location === "/inbox") {
    return { title: "Type", options: ["All", "AI", "Alerts"] };
  }
  return null;
}

export function SecondaryBar({
  collapsed,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const [location] = useLocation();
  const [selected, setSelected] = useState("All");
  const config = getFilterConfig(location);

  // Routes without contextual filters render no secondary bar at all.
  if (!config) return null;

  if (collapsed) {
    return (
      <div className="flex w-10 flex-col items-center border-r border-hairline bg-rail py-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleCollapse}
          title="Show context sidebar"
        >
          <ChevronLeft className="size-4 rotate-180" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-56 border-r border-hairline bg-surface overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-hairline px-3 py-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="size-4" />
          Context
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleCollapse}
          title="Hide context sidebar"
        >
          <ChevronLeft className="size-4" />
        </Button>
      </div>

      {/* Route-specific filters */}
      <div className="flex-1 space-y-4 p-3">
        <div>
          <SectionLabel>{config.title}</SectionLabel>
          <div className="mt-2 space-y-1">
            {config.options.map((option) => (
              <button
                key={option}
                onClick={() => setSelected(option)}
                className={cn(
                  "w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                  selected === option
                    ? "bg-elevated font-medium text-foreground"
                    : "text-muted-foreground hover:bg-elevated hover:text-foreground",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
