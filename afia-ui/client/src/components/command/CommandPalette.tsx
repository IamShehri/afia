import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  railNav,
  studioNav,
  labNav,
  clinicalNav,
  aiNav,
} from "@/data/nav";
import { patients } from "@/data/patients";
import { Monogram, RiskBadge } from "@/components/primitives";
import {
  Sparkles,
  Moon,
  Sun,
  PanelRight,
  Plus,
  CalendarPlus,
  Search,
  ArrowRight,
} from "lucide-react";

export function CommandPalette() {
  const {
    paletteOpen,
    setPaletteOpen,
    toggleAssistant,
    toggleSecondary,
    openInspector,
  } = useWorkspace();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!paletteOpen) setQuery("");
  }, [paletteOpen]);

  const run = (fn: () => void) => {
    fn();
    setPaletteOpen(false);
  };

  const matchedPatients = patients
    .filter((p) =>
      query.length < 1
        ? true
        : `${p.name} ${p.id} ${p.condition}`
            .toLowerCase()
            .includes(query.toLowerCase()),
    )
    .slice(0, 6);

  return (
    <CommandDialog
      open={paletteOpen}
      onOpenChange={setPaletteOpen}
      className="max-w-[640px] border-border"
      title="Command palette"
      description="Search patients, navigate, and run actions"
    >
      <CommandInput
        placeholder="Search patients, pages, and actions…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>
          <div className="flex flex-col items-center gap-1 py-4 text-muted-foreground">
            <Search className="size-5 opacity-50" />
            <span className="text-sm">No matches for “{query}”.</span>
          </div>
        </CommandEmpty>

        <CommandGroup heading="Patients">
          {matchedPatients.map((p) => (
            <CommandItem
              key={p.id}
              value={`patient ${p.name} ${p.id} ${p.condition}`}
              onSelect={() =>
                run(() => {
                  setLocation(`/patients/${p.id}`);
                  openInspector(p.id);
                })
              }
            >
              <Monogram name={p.name} size={22} />
              <span className="flex-1 truncate">{p.name}</span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {p.id}
              </span>
              <RiskBadge risk={p.risk} showLabel={false} />
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Studio">
          {studioNav.map((n) => (
            <CommandItem
              key={n.id}
              value={`studio ${n.label}`}
              onSelect={() => run(() => setLocation(n.href))}
            >
              <n.icon />
              <span className="flex-1">{n.label}</span>
              <ArrowRight className="size-3.5 opacity-40" />
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Lab">
          {labNav.map((n) => (
            <CommandItem
              key={n.id}
              value={`lab ${n.label}`}
              onSelect={() => run(() => setLocation(n.href))}
            >
              <n.icon />
              <span className="flex-1">{n.label}</span>
              <ArrowRight className="size-3.5 opacity-40" />
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Workspace">
          {railNav.map((n) => (
            <CommandItem
              key={n.id}
              value={`go ${n.label}`}
              onSelect={() => run(() => setLocation(n.href))}
            >
              <n.icon />
              <span className="flex-1">Go to {n.label}</span>
              <ArrowRight className="size-3.5 opacity-40" />
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Clinical">
          {clinicalNav.map((n) => (
            <CommandItem
              key={n.id}
              value={`clinical ${n.label}`}
              onSelect={() => run(() => setLocation(n.href))}
            >
              <n.icon />
              <span className="flex-1">{n.label}</span>
              <ArrowRight className="size-3.5 opacity-40" />
            </CommandItem>
          ))}
          <CommandItem
            value="ask afia assistant ai"
            onSelect={() => run(() => setLocation(aiNav.href))}
          >
            <aiNav.icon className="text-ai" />
            <span className="flex-1">{aiNav.label}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            value="ask afia assistant panel"
            onSelect={() => run(() => toggleAssistant())}
          >
            <Sparkles className="text-ai" />
            <span className="flex-1">Open AFIA Assistant panel</span>
            <span className="font-mono text-[11px] text-muted-foreground">
              ⌘J
            </span>
          </CommandItem>
          <CommandItem
            value="new patient admit create"
            onSelect={() => run(() => setLocation("/patients"))}
          >
            <Plus />
            <span className="flex-1">Go to Patients</span>
          </CommandItem>
          <CommandItem
            value="schedule new appointment"
            onSelect={() => run(() => setLocation("/schedule"))}
          >
            <CalendarPlus />
            <span className="flex-1">Go to Schedule</span>
          </CommandItem>
          <CommandItem
            value="toggle theme dark light mode"
            onSelect={() => run(() => toggleTheme?.())}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
            <span className="flex-1">
              Switch to {theme === "dark" ? "light" : "dark"} mode
            </span>
          </CommandItem>
          <CommandItem
            value="toggle context sidebar panel"
            onSelect={() => run(() => toggleSecondary())}
          >
            <PanelRight />
            <span className="flex-1">Toggle context sidebar</span>
            <span className="font-mono text-[11px] text-muted-foreground">
              ⌘\
            </span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
