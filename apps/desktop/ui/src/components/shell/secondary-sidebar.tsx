import { useLocation } from "react-router-dom";
import {
  Star,
  Clock,
  Filter,
  Bookmark,
  LayoutGrid,
  AlertTriangle,
  Heart,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
  active?: boolean;
}

interface ContextSection {
  id: string;
  label: string;
  items: ContextItem[];
}

const contextByRoute: Record<string, ContextSection[]> = {
  default: [
    {
      id: "views",
      label: "Saved views",
      items: [
        { id: "all", label: "All patients", icon: LayoutGrid, count: 42, active: true },
        { id: "critical", label: "Critical", icon: AlertTriangle, count: 3 },
        { id: "mine", label: "Assigned to me", icon: Heart, count: 8 },
        { id: "monitoring", label: "Monitoring", icon: Activity, count: 11 },
      ],
    },
    {
      id: "filters",
      label: "Filters",
      items: [
        { id: "unit", label: "ICU · North", icon: Filter },
        { id: "today", label: "Admitted today", icon: Clock },
        { id: "high-risk", label: "High risk score", icon: Filter },
      ],
    },
    {
      id: "pinned",
      label: "Pinned",
      items: [
        { id: "p1", label: "Daniel Reyes", icon: Star },
        { id: "p2", label: "Elena Petrova", icon: Star },
      ],
    },
  ],
};

export function SecondarySidebar() {
  const { pathname } = useLocation();
  const sections = contextByRoute[pathname] ?? contextByRoute.default;

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface/60 lg:flex">
      <div className="flex h-12 items-center gap-2 border-b border-border px-4">
        <Bookmark className="h-4 w-4 text-muted-foreground" />
        <span className="text-[13px] font-semibold">Context</span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.id} className="mb-5">
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {section.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      className={cn(
                        "flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-[13px] font-medium transition-colors",
                        item.active
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4 shrink-0" />}
                      <span className="flex-1 truncate text-left">{item.label}</span>
                      {item.count != null && (
                        <span className="text-[11px] tabular-nums text-muted-foreground/70">
                          {item.count}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
