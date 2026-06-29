import { AnimatePresence, motion } from "framer-motion";
import {
  Star,
  Clock,
  Filter,
  Bookmark,
  Layers,
  ChevronDown,
  Circle,
} from "lucide-react";
import { useShell } from "@/stores/shell-store";
import { findNavItem } from "@/lib/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ContextSection {
  id: string;
  label: string;
  icon: typeof Star;
  items: { id: string; label: string; meta?: string; dot?: string }[];
}

const sections: ContextSection[] = [
  {
    id: "views",
    label: "Saved views",
    icon: Bookmark,
    items: [
      { id: "v1", label: "My panel", meta: "248" },
      { id: "v2", label: "Critical today", meta: "6", dot: "hsl(var(--destructive))" },
      { id: "v3", label: "Awaiting results", meta: "12", dot: "hsl(var(--warning))" },
      { id: "v4", label: "Discharges", meta: "4", dot: "hsl(var(--success))" },
    ],
  },
  {
    id: "filters",
    label: "Quick filters",
    icon: Filter,
    items: [
      { id: "f1", label: "Cardiology" },
      { id: "f2", label: "ICU" },
      { id: "f3", label: "High risk (>70)" },
      { id: "f4", label: "AI-flagged" },
    ],
  },
  {
    id: "collections",
    label: "Collections",
    icon: Layers,
    items: [
      { id: "c1", label: "Research cohort A", meta: "31" },
      { id: "c2", label: "Diabetes program", meta: "58" },
    ],
  },
];

const favorites = [
  { id: "p2", label: "James Whitfield", meta: "ICU-04" },
  { id: "p6", label: "Robert Chen", meta: "ICU-02" },
  { id: "p1", label: "Amara Okafor", meta: "3B-12" },
];

function SectionHeader({
  label,
  icon: Icon,
}: {
  label: string;
  icon: typeof Star;
}) {
  return (
    <div className="flex items-center gap-2 px-2.5 pb-1 pt-3">
      <Icon className="size-3.5 text-muted-foreground/70" />
      <span className="flex-1 text-2xs font-semibold uppercase tracking-wider text-muted-foreground/70">
        {label}
      </span>
      <ChevronDown className="size-3.5 text-muted-foreground/50" />
    </div>
  );
}

function Row({
  label,
  meta,
  dot,
}: {
  label: string;
  meta?: string;
  dot?: string;
}) {
  return (
    <button className="group flex h-7 w-full items-center gap-2 rounded-md px-2.5 text-[0.8125rem] text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
      {dot ? (
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: dot }}
        />
      ) : (
        <Circle className="size-1.5 shrink-0 fill-current text-muted-foreground/40" />
      )}
      <span className="truncate">{label}</span>
      {meta && (
        <span className="ml-auto text-2xs tabular-nums text-muted-foreground/60">
          {meta}
        </span>
      )}
    </button>
  );
}

export function SecondarySidebar() {
  const { secondaryOpen, activeModule } = useShell();
  const item = findNavItem(activeModule);

  return (
    <AnimatePresence initial={false}>
      {secondaryOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 232, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 38 }}
          className="relative z-10 h-full overflow-hidden border-r border-border bg-canvas"
        >
          <div className="flex h-full w-[232px] flex-col">
            <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3.5">
              <h2 className="text-sm font-semibold text-foreground">
                {item?.label ?? "Context"}
              </h2>
            </div>

            <ScrollArea className="flex-1">
              <div className="px-1.5 pb-4">
                <SectionHeader label="Favorites" icon={Star} />
                <div className="flex flex-col gap-0.5">
                  {favorites.map((f) => (
                    <Row key={f.id} label={f.label} meta={f.meta} />
                  ))}
                </div>

                {sections.map((section) => (
                  <div key={section.id}>
                    <SectionHeader label={section.label} icon={section.icon} />
                    <div className="flex flex-col gap-0.5">
                      {section.items.map((it) => (
                        <Row
                          key={it.id}
                          label={it.label}
                          meta={it.meta}
                          dot={it.dot}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                <SectionHeader label="Recents" icon={Clock} />
                <div className="flex flex-col gap-0.5">
                  <Row label="Lena Hoffmann" meta="2A-07" />
                  <Row label="Priya Nair" meta="4C-21" />
                  <Row label="Sofia Romano" />
                </div>
              </div>
            </ScrollArea>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
