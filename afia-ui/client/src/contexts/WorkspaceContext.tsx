import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface InspectorState {
  open: boolean;
  patientId?: string;
}

interface WorkspaceContextType {
  /* command palette */
  paletteOpen: boolean;
  setPaletteOpen: (v: boolean) => void;

  /* AI assistant slide-over */
  assistantOpen: boolean;
  setAssistantOpen: (v: boolean) => void;
  toggleAssistant: () => void;

  /* secondary (context) sidebar */
  secondaryCollapsed: boolean;
  toggleSecondary: () => void;

  /* inspector slide-over */
  inspector: InspectorState;
  openInspector: (patientId: string) => void;
  closeInspector: () => void;

  /* pinned + recents (persisted) */
  pinned: string[];
  togglePin: (id: string) => void;
  recents: string[];
  pushRecent: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
);

const read = (key: string, fallback: string[]) => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as string[]) : fallback;
  } catch {
    return fallback;
  }
};

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [secondaryCollapsed, setSecondaryCollapsed] = useState(false);
  const [inspector, setInspector] = useState<InspectorState>({ open: false });

  const [pinned, setPinned] = useState<string[]>(() =>
    read("afia:pinned", ["MRN-04261"]),
  );
  const [recents, setRecents] = useState<string[]>(() =>
    read("afia:recents", []),
  );

  useEffect(() => {
    localStorage.setItem("afia:pinned", JSON.stringify(pinned));
  }, [pinned]);
  useEffect(() => {
    localStorage.setItem("afia:recents", JSON.stringify(recents));
  }, [recents]);

  const toggleAssistant = useCallback(() => setAssistantOpen((v) => !v), []);
  const toggleSecondary = useCallback(
    () => setSecondaryCollapsed((v) => !v),
    [],
  );

  const openInspector = useCallback(
    (patientId: string) => setInspector({ open: true, patientId }),
    [],
  );
  const closeInspector = useCallback(
    () => setInspector((s) => ({ ...s, open: false })),
    [],
  );

  const togglePin = useCallback((id: string) => {
    setPinned((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const pushRecent = useCallback((id: string) => {
    setRecents((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 8));
  }, []);

  /* global keyboard shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (mod && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setAssistantOpen((v) => !v);
      }
      if (mod && e.key === "\\") {
        e.preventDefault();
        setSecondaryCollapsed((v) => !v);
      }
      if (e.key === "Escape") {
        setInspector((s) => (s.open ? { ...s, open: false } : s));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(
    () => ({
      paletteOpen,
      setPaletteOpen,
      assistantOpen,
      setAssistantOpen,
      toggleAssistant,
      secondaryCollapsed,
      toggleSecondary,
      inspector,
      openInspector,
      closeInspector,
      pinned,
      togglePin,
      recents,
      pushRecent,
    }),
    [
      paletteOpen,
      assistantOpen,
      toggleAssistant,
      secondaryCollapsed,
      toggleSecondary,
      inspector,
      openInspector,
      closeInspector,
      pinned,
      togglePin,
      recents,
      pushRecent,
    ],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx)
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
