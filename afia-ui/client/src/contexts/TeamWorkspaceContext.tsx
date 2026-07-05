import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  createTeamWorkspace,
  listMyWorkspaces,
  type TeamWorkspace,
  type WorkspaceMemberRole,
} from "@/lib/team-workspaces";

interface TeamWorkspaceContextType {
  /** null = Personal library (workspace_id IS NULL). */
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string | null) => void;
  workspaces: TeamWorkspace[];
  activeWorkspace: TeamWorkspace | null;
  myRole: WorkspaceMemberRole | null;
  canEditInActiveWorkspace: boolean;
  loading: boolean;
  refreshWorkspaces: () => Promise<void>;
  createWorkspace: (name: string) => Promise<TeamWorkspace>;
}

const TeamWorkspaceContext = createContext<TeamWorkspaceContextType | undefined>(
  undefined,
);

export function TeamWorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useAuth();
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(
    null,
  );
  const [workspaces, setWorkspaces] = useState<TeamWorkspace[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshWorkspaces = useCallback(async () => {
    if (!session) {
      setWorkspaces([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const rows = await listMyWorkspaces();
      setWorkspaces(rows);
      setActiveWorkspaceId((current) =>
        current && !rows.some((row) => row.id === current) ? null : current,
      );
    } catch {
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void refreshWorkspaces();
  }, [refreshWorkspaces]);

  const activeWorkspace = useMemo(
    () => workspaces.find((row) => row.id === activeWorkspaceId) ?? null,
    [workspaces, activeWorkspaceId],
  );

  const myRole = activeWorkspace?.myRole ?? null;

  const canEditInActiveWorkspace =
    activeWorkspaceId === null ||
    myRole === "owner" ||
    myRole === "editor";

  const createWorkspace = useCallback(async (name: string) => {
    const created = await createTeamWorkspace(name);
    setWorkspaces((prev) => [...prev, created]);
    setActiveWorkspaceId(created.id);
    return created;
  }, []);

  const value = useMemo(
    () => ({
      activeWorkspaceId,
      setActiveWorkspaceId,
      workspaces,
      activeWorkspace,
      myRole,
      canEditInActiveWorkspace,
      loading,
      refreshWorkspaces,
      createWorkspace,
    }),
    [
      activeWorkspaceId,
      workspaces,
      activeWorkspace,
      myRole,
      canEditInActiveWorkspace,
      loading,
      refreshWorkspaces,
      createWorkspace,
    ],
  );

  return (
    <TeamWorkspaceContext.Provider value={value}>
      {children}
    </TeamWorkspaceContext.Provider>
  );
}

export function useTeamWorkspace() {
  const ctx = useContext(TeamWorkspaceContext);
  if (!ctx) {
    throw new Error("useTeamWorkspace must be used within TeamWorkspaceProvider");
  }
  return ctx;
}
