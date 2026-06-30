import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface WorkspaceContextValue {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  inspectorOpen: boolean;
  setInspectorOpen: (open: boolean) => void;
  toggleInspector: () => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  assistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
  toggleAssistant: () => void;
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const toggleSidebar = useCallback(() => setSidebarCollapsed((v) => !v), []);
  const toggleInspector = useCallback(() => setInspectorOpen((v) => !v), []);
  const toggleAssistant = useCallback(() => setAssistantOpen((v) => !v), []);

  const value = useMemo(
    () => ({
      sidebarCollapsed,
      toggleSidebar,
      inspectorOpen,
      setInspectorOpen,
      toggleInspector,
      commandOpen,
      setCommandOpen,
      assistantOpen,
      setAssistantOpen,
      toggleAssistant,
      selectedPatientId,
      setSelectedPatientId,
    }),
    [
      sidebarCollapsed,
      toggleSidebar,
      inspectorOpen,
      toggleInspector,
      commandOpen,
      assistantOpen,
      toggleAssistant,
      selectedPatientId,
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
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
