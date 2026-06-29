import { useEffect } from "react";
import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Sparkles,
  Plus,
  CalendarPlus,
  FileText,
  Sun,
  Moon,
  PanelRight,
  ArrowRight,
  CornerDownLeft,
} from "lucide-react";
import { useShell } from "@/stores/shell-store";
import { useTheme } from "@/app/providers/theme-provider";
import { primaryNav } from "@/lib/navigation";
import { patients, statusLabels } from "@/lib/mock-data";
import { Kbd } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CommandPalette() {
  const {
    paletteOpen,
    setPaletteOpen,
    setActiveModule,
    setSelectedPatientId,
    setInspectorOpen,
    toggleAssistant,
  } = useShell();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (!paletteOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen, setPaletteOpen]);

  const run = (fn: () => void) => {
    fn();
    setPaletteOpen(false);
  };

  return (
    <Dialog.Root open={paletteOpen} onOpenChange={setPaletteOpen}>
      <AnimatePresence>
        {paletteOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content
              aria-label="Command palette"
              className="fixed left-1/2 top-[18%] z-50 w-full max-w-xl -translate-x-1/2 px-4 focus:outline-none"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              >
                <Command
                  loop
                  className="overflow-hidden rounded-xl border border-border bg-popover shadow-overlay"
                >
                  <div className="flex items-center gap-2.5 border-b border-border px-3.5">
                    <Search className="size-4 shrink-0 text-muted-foreground" />
                    <Command.Input
                      autoFocus
                      placeholder="Search or type a command…"
                      className="h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                    <Kbd>Esc</Kbd>
                  </div>

                  <Command.List className="max-h-[22rem] overflow-y-auto p-1.5">
                    <Command.Empty className="py-10 text-center text-sm text-muted-foreground">
                      No results found.
                    </Command.Empty>

                    <Command.Group
                      heading="Actions"
                      className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground/70"
                    >
                      <Item
                        icon={Plus}
                        label="New encounter"
                        shortcut="N"
                        onSelect={() => run(() => setActiveModule("encounters"))}
                      />
                      <Item
                        icon={CalendarPlus}
                        label="Schedule appointment"
                        onSelect={() => run(() => setActiveModule("schedule"))}
                      />
                      <Item
                        icon={FileText}
                        label="Draft clinical note with AI"
                        onSelect={() => run(() => toggleAssistant())}
                      />
                      <Item
                        icon={Sparkles}
                        label="Open AI assistant"
                        shortcut="⌘J"
                        onSelect={() => run(() => toggleAssistant())}
                      />
                    </Command.Group>

                    <Command.Group
                      heading="Patients"
                      className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground/70"
                    >
                      {patients.slice(0, 5).map((p) => (
                        <Item
                          key={p.id}
                          value={`patient ${p.name} ${p.mrn} ${p.condition}`}
                          icon={ArrowRight}
                          label={p.name}
                          meta={`${p.mrn} · ${statusLabels[p.status]}`}
                          onSelect={() =>
                            run(() => {
                              setSelectedPatientId(p.id);
                              setInspectorOpen(true);
                              setActiveModule("patients");
                            })
                          }
                        />
                      ))}
                    </Command.Group>

                    <Command.Group
                      heading="Navigate"
                      className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground/70"
                    >
                      {primaryNav
                        .flatMap((g) => g.items)
                        .map((item) => (
                          <Item
                            key={item.id}
                            value={`go to ${item.label}`}
                            icon={item.icon}
                            label={`Go to ${item.label}`}
                            onSelect={() =>
                              run(() => setActiveModule(item.id))
                            }
                          />
                        ))}
                    </Command.Group>

                    <Command.Group
                      heading="Appearance"
                      className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground/70"
                    >
                      <Item
                        icon={Moon}
                        label="Switch to dark theme"
                        onSelect={() => run(() => setTheme("dark"))}
                      />
                      <Item
                        icon={Sun}
                        label="Switch to light theme"
                        onSelect={() => run(() => setTheme("light"))}
                      />
                      <Item
                        icon={PanelRight}
                        label="Toggle inspector"
                        shortcut="⌘I"
                        onSelect={() => run(() => setInspectorOpen(true))}
                      />
                    </Command.Group>
                  </Command.List>

                  <div className="flex items-center justify-between border-t border-border px-3 py-2 text-2xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="size-3 text-primary" /> AFIA Command
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <CornerDownLeft className="size-3" /> select
                      </span>
                      <span className="flex items-center gap-1">
                        <Kbd>↑</Kbd>
                        <Kbd>↓</Kbd> navigate
                      </span>
                    </span>
                  </div>
                </Command>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function Item({
  icon: Icon,
  label,
  meta,
  shortcut,
  value,
  onSelect,
}: {
  icon: typeof Search;
  label: string;
  meta?: string;
  shortcut?: string;
  value?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      value={value ?? label}
      onSelect={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-foreground outline-none",
        "data-[selected=true]:bg-muted",
      )}
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="flex-1 truncate">{label}</span>
      {meta && (
        <span className="truncate text-2xs text-muted-foreground">{meta}</span>
      )}
      {shortcut && <Kbd>{shortcut}</Kbd>}
    </Command.Item>
  );
}
