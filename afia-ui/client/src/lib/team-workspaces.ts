import { supabase } from "@/lib/supabase";

export type WorkspaceMemberRole = "owner" | "editor" | "viewer";
export type InviteRole = "editor" | "viewer";

export interface TeamWorkspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  myRole: WorkspaceMemberRole;
}

export interface WorkspaceMemberRow {
  userId: string;
  role: WorkspaceMemberRole;
  joinedAt: string;
  email: string | null;
}

export interface WorkspaceInviteRow {
  id: string;
  email: string;
  role: InviteRole;
  expiresAt: string;
  createdAt: string;
}

async function invokeWorkspaceInvites<T>(
  body: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke("workspace-invites", {
    body,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof (data as { error: unknown }).error === "string"
  ) {
    throw new Error((data as { error: string }).error);
  }

  return data as T;
}

export async function listMyWorkspaces(): Promise<TeamWorkspace[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("workspace_members")
    .select("role, workspaces(id, name, owner_id, created_at)")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).flatMap((row) => {
    const typed = row as {
      role: WorkspaceMemberRole;
      workspaces: {
        id: string;
        name: string;
        owner_id: string;
        created_at: string;
      } | null;
    };
    const workspace = typed.workspaces;
    if (!workspace) return [];
    return [
      {
        id: workspace.id,
        name: workspace.name,
        ownerId: workspace.owner_id,
        createdAt: workspace.created_at,
        myRole: typed.role,
      },
    ];
  });
}

export async function createTeamWorkspace(name: string): Promise<TeamWorkspace> {
  const { workspace } = await invokeWorkspaceInvites<{
    workspace: {
      id: string;
      name: string;
      owner_id: string;
      created_at: string;
    };
  }>({
    action: "create_workspace",
    name: name.trim(),
  });

  return {
    id: workspace.id,
    name: workspace.name,
    ownerId: workspace.owner_id,
    createdAt: workspace.created_at,
    myRole: "owner",
  };
}

export async function listWorkspaceMembers(
  workspaceId: string,
): Promise<WorkspaceMemberRow[]> {
  const { data, error } = await supabase
    .from("workspace_members")
    .select("user_id, role, joined_at, profiles(email)")
    .eq("workspace_id", workspaceId)
    .order("joined_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const typed = row as {
      user_id: string;
      role: WorkspaceMemberRole;
      joined_at: string;
      profiles: { email: string | null } | null;
    };
    return {
      userId: typed.user_id,
      role: typed.role,
      joinedAt: typed.joined_at,
      email: typed.profiles?.email ?? null,
    };
  });
}

export async function listPendingInvites(
  workspaceId: string,
): Promise<WorkspaceInviteRow[]> {
  const { data, error } = await supabase
    .from("workspace_invites")
    .select("id, email, role, expires_at, created_at, accepted_at")
    .eq("workspace_id", workspaceId)
    .is("accepted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    email: row.email as string,
    role: row.role as InviteRole,
    expiresAt: row.expires_at as string,
    createdAt: row.created_at as string,
  }));
}

export interface CreateWorkspaceInviteResult {
  invite: {
    id: string;
    workspace_id: string;
    email: string;
    role: InviteRole;
    expires_at: string;
    token: string;
  };
  email_sent: boolean;
  email_error?: string;
}

export async function createWorkspaceInvite(
  workspaceId: string,
  email: string,
  role: InviteRole,
): Promise<CreateWorkspaceInviteResult> {
  return invokeWorkspaceInvites({
    action: "create",
    workspace_id: workspaceId,
    email: email.trim(),
    role,
  });
}

export async function acceptWorkspaceInvite(token: string): Promise<{
  workspaceId: string;
  role: InviteRole;
}> {
  const result = await invokeWorkspaceInvites<{
    ok: boolean;
    workspace_id: string;
    role: InviteRole;
  }>({
    action: "accept",
    token,
  });

  return {
    workspaceId: result.workspace_id,
    role: result.role,
  };
}

export async function leaveWorkspace(workspaceId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not signed in");
  }

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function revokeWorkspaceInvite(inviteId: string): Promise<void> {
  const { error } = await supabase
    .from("workspace_invites")
    .delete()
    .eq("id", inviteId);

  if (error) {
    throw new Error(error.message);
  }
}
