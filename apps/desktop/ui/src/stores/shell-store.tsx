import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ShellState {
  activeModule: string;
  setActiveModule: (id: string) => void;

  primaryCollapsed: boolean;
  togglePrimary: () => void;

  secondaryOpen: boolean;
  toggleSecondary: () => void;

  inspectorOpen: boolean;
  setInspectorOpen: (open: boolean) => void;
  toggleInspector: () => void;

  assistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
  toggleAssistant: () => void;

  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;

  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
}

const ShellContext = createContext<ShellState | null>(null);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [primaryCollapsed, setPrimaryCollapsed] = useState(false);
  const [secondaryOpen, setSecondaryOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    "p2",
  );

  const value = useMemo<ShellState>(
    () => ({
      activeModule,
      setActiveModule,
      primaryCollapsed,
      togglePrimary: () => setPrimaryCollapsed((p) => !p),
      secondaryOpen,
      toggleSecondary: () => setSecondaryOpen((p) => !p),
      inspectorOpen,
      setInspectorOpen,
      toggleInspector: () => setInspectorOpen((p) => !p),
      assistantOpen,
      setAssistantOpen,
      toggleAssistant: () => setAssistantOpen((p) => !p),
      paletteOpen,
      setPaletteOpen,
      selectedPatientId,
      setSelectedPatientId,
    }),
    [
      activeModule,
      primaryCollapsed,
      secondaryOpen,
      inspectorOpen,
      assistantOpen,
      paletteOpen,
      selectedPatientId,
    ],
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used within ShellProvider");
  return ctx;
}

/** Global keyboard shortcut handler hook. */
export function useGlobalShortcuts() {
  const shell = useShell();
  return useCallback(
    (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        shell.setPaletteOpen(true);
      }
      if (meta && e.key.toLowerCase() === "i") {
        e.preventDefault();
        shell.toggleInspector();
      }
      if (meta && e.key.toLowerCase() === "j") {
        e.preventDefault();
        shell.toggleAssistant();
      }
      if (meta && e.key === "\\") {
        e.preventDefault();
        shell.togglePrimary();
      }
    },
    [shell],
  );
}
