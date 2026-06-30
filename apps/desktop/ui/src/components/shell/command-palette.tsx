import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Sparkles,
  ArrowRight,
  CornerDownLeft,
  type LucideIcon,
} from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
import { primaryNav, footerNav } from "@/data/navigation";
import { patients } from "@/data/mock";
import { Kbd } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  group: string;
  action: () => void;
}

export function CommandPalette() {
  const { commandOpen, setCommandOpen, setAssistantOpen, toggleInspector } =
    useWorkspace();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<Command[]>(() => {
    const nav = [...primaryNav.flatMap((g) => g.items), ...footerNav].map(
      (item) => ({
        id: `nav-${item.id}`,
        label: item.label,
        hint: "Navigate",
        icon: item.icon,
        group: "Navigation",
        action: () => navigate(item.to),
      }),
    );
    const actions: Command[] = [
      {
        id: "ai",
        label: "Ask AFIA Assistant",
        hint: "AI",
        icon: Sparkles,
        group: "Actions",
        action: () => setAssistantOpen(true),
      },
      {
        id: "inspector",
        label: "Toggle inspector panel",
        icon: ArrowRight,
        group: "Actions",
        action: () => toggleInspector(),
      },
    ];
    const patientCmds = patients.slice(0, 6).map((p) => ({
      id: `pt-${p.id}`,
      label: p.name,
      hint: `${p.mrn} · ${p.room}`,
      icon: Search,
      group: "Patients",
      action: () => navigate("/patients"),
    }));
    return [...actions, ...nav, ...patientCmds];
  }, [navigate, setAssistantOpen, toggleInspector]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.hint?.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q),
    );
  }, [commands, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Command[]>();
    filtered.forEach((c) => {
      if (!map.has(c.group)) map.set(c.group, []);
      map.get(c.group)!.push(c);
    });
    return Array.from(map.entries());
  }, [filtered]);

  // global ⌘K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
      if (e.key === "Escape") setCommandOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCommandOpen]);

  useEffect(() => {
    if (commandOpen) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [commandOpen]);

  useEffect(() => setActive(0), [query]);

  function run(cmd: Command) {
    cmd.action();
    setCommandOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[active];
      if (cmd) run(cmd);
    }
  }

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {commandOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-background/50 p-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setCommandOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ type: "spring", stiffness: 460, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search or jump to…"
                className="h-12 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
              />
              <Kbd>esc</Kbd>
            </div>

            <div className="max-h-[52vh] overflow-y-auto p-2">
              {filtered.length === 0 && (
                <div className="px-3 py-10 text-center text-[13px] text-muted-foreground">
                  No results for &ldquo;{query}&rdquo;
                </div>
              )}
              {grouped.map(([group, cmds]) => (
                <div key={group} className="mb-1">
                  <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {group}
                  </p>
                  {cmds.map((cmd) => {
                    flatIndex += 1;
                    const idx = flatIndex;
                    const Icon = cmd.icon;
                    const isActive = idx === active;
                    return (
                      <button
                        key={cmd.id}
                        onMouseMove={() => setActive(idx)}
                        onClick={() => run(cmd)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors",
                          isActive
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-md",
                            isActive ? "bg-surface-raised text-primary" : "text-muted-foreground",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="flex-1 truncate font-medium text-foreground/90">
                          {cmd.label}
                        </span>
                        {cmd.hint && (
                          <span className="truncate text-[11px] text-muted-foreground/70">
                            {cmd.hint}
                          </span>
                        )}
                        {isActive && (
                          <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary" />
                AFIA command palette
              </span>
              <span className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <Kbd>↵</Kbd>
                  select
                </span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
