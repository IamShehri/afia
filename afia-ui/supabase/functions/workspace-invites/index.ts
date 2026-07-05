import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type InviteRow = {
  id: string;
  workspace_id: string;
  email: string;
  role: string;
  token: string;
  invited_by: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function writeAudit(
  supabase: SupabaseClient,
  userId: string,
  action: string,
  resourceId: string,
): Promise<void> {
  try {
    const { error } = await supabase.from("audit_log").insert({
      user_id: userId,
      action,
      resource_type: "workspace",
      resource_id: resourceId,
    });
    if (error) {
      console.error("[audit] insert failed:", error.message);
    }
  } catch (err) {
    console.error("[audit] insert failed:", err);
  }
}

function createServiceClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase service role env not configured");
  }
  return createClient(supabaseUrl, serviceRoleKey);
}

async function sendInviteEmail(
  toEmail: string,
  workspaceName: string,
  token: string,
): Promise<{ sent: true } | { sent: false; error: string }> {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const appPublicUrl = Deno.env.get("APP_PUBLIC_URL");
  const fromAddress = Deno.env.get("RESEND_FROM") ??
    "AFIA <onboarding@resend.dev>";

  if (!resendKey) {
    return {
      sent: false,
      error:
        "RESEND_API_KEY secret is not configured — set it via: supabase secrets set RESEND_API_KEY=...",
    };
  }
  if (!appPublicUrl) {
    return {
      sent: false,
      error:
        "APP_PUBLIC_URL secret is not configured — set it via: supabase secrets set APP_PUBLIC_URL=...",
    };
  }

  const acceptUrl = `${appPublicUrl.replace(/\/$/, "")}/invite/${token}`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [toEmail],
        subject: `You're invited to ${workspaceName} on AFIA`,
        html: [
          `<p>You have been invited to join the workspace <strong>${workspaceName}</strong> on AFIA.</p>`,
          `<p><a href="${acceptUrl}">Accept invitation</a></p>`,
          `<p>This link expires in 7 days. If you did not expect this email, you can ignore it.</p>`,
        ].join(""),
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return {
        sent: false,
        error: `Failed to send invite email (${response.status}): ${detail}`,
      };
    }

    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return { sent: false, error: message };
  }
}

function inviteResponsePayload(row: InviteRow) {
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    email: row.email,
    role: row.role,
    expires_at: row.expires_at,
    token: row.token,
  };
}

async function handleCreateWorkspace(
  supabase: SupabaseClient,
  userId: string,
  body: Record<string, unknown>,
) {
  const name = body.name;
  if (typeof name !== "string" || !name.trim()) {
    return jsonResponse({ error: "name is required" }, 400);
  }

  const { data, error } = await supabase
    .from("workspaces")
    .insert({ name: name.trim(), owner_id: userId })
    .select("id, name, owner_id, created_at")
    .single();

  if (error || !data) {
    return jsonResponse(
      { error: error?.message ?? "Failed to create workspace" },
      500,
    );
  }

  await writeAudit(supabase, userId, "create", data.id);

  return jsonResponse({ workspace: data });
}

async function handleCreateInvite(
  supabase: SupabaseClient,
  userId: string,
  body: Record<string, unknown>,
) {
  const workspaceId = body.workspace_id;
  const email = body.email;
  const role = body.role;

  if (typeof workspaceId !== "string" || !workspaceId.trim()) {
    return jsonResponse({ error: "workspace_id is required" }, 400);
  }
  if (typeof email !== "string" || !email.trim()) {
    return jsonResponse({ error: "email is required" }, 400);
  }
  if (role !== "editor" && role !== "viewer") {
    return jsonResponse({ error: "role must be editor or viewer" }, 400);
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id, name")
    .eq("id", workspaceId)
    .maybeSingle();

  if (workspaceError) {
    return jsonResponse({ error: workspaceError.message }, 500);
  }
  if (!workspace) {
    return jsonResponse({ error: "Workspace not found or not authorized" }, 403);
  }

  const normalizedEmail = normalizeEmail(email);

  const { data: invite, error: inviteError } = await supabase
    .from("workspace_invites")
    .insert({
      workspace_id: workspaceId,
      email: normalizedEmail,
      role,
      invited_by: userId,
    })
    .select("*")
    .single();

  if (inviteError || !invite) {
    return jsonResponse(
      { error: inviteError?.message ?? "Failed to create invite" },
      500,
    );
  }

  const row = invite as InviteRow;
  const emailResult = await sendInviteEmail(
    normalizedEmail,
    workspace.name,
    row.token,
  );

  if (!emailResult.sent) {
    console.error("[workspace-invites] email not sent:", emailResult.error);
    return jsonResponse({
      invite: inviteResponsePayload(row),
      email_sent: false,
      email_error: emailResult.error,
    });
  }

  return jsonResponse({
    invite: inviteResponsePayload(row),
    email_sent: true,
  });
}

async function handleAcceptInvite(
  userClient: SupabaseClient,
  userId: string,
  userEmail: string,
  body: Record<string, unknown>,
) {
  const token = body.token;
  if (typeof token !== "string" || !token.trim()) {
    return jsonResponse({ error: "token is required" }, 400);
  }

  // Service role: invitees have no RLS path on workspace_invites (by design).
  // We validate token, expiry, and email match before mutating membership.
  const service = createServiceClient();

  const { data: invite, error: inviteError } = await service
    .from("workspace_invites")
    .select("*")
    .eq("token", token.trim())
    .maybeSingle();

  if (inviteError) {
    return jsonResponse({ error: inviteError.message }, 500);
  }
  if (!invite) {
    return jsonResponse({ error: "Invite not found" }, 404);
  }

  const row = invite as InviteRow;

  if (row.accepted_at) {
    return jsonResponse({ error: "Invite already accepted" }, 409);
  }

  if (new Date(row.expires_at).getTime() <= Date.now()) {
    return jsonResponse({ error: "Invite has expired" }, 410);
  }

  if (normalizeEmail(userEmail) !== normalizeEmail(row.email)) {
    return jsonResponse(
      { error: "This invite was sent to a different email address" },
      403,
    );
  }

  const { data: existingMember } = await service
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", row.workspace_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (!existingMember) {
    const { error: memberError } = await service.from("workspace_members").insert({
      workspace_id: row.workspace_id,
      user_id: userId,
      role: row.role,
    });

    if (memberError) {
      return jsonResponse({ error: memberError.message }, 500);
    }
  }

  const { error: acceptError } = await service
    .from("workspace_invites")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", row.id);

  if (acceptError) {
    return jsonResponse({ error: acceptError.message }, 500);
  }

  await writeAudit(userClient, userId, "join", row.workspace_id);

  return jsonResponse({
    ok: true,
    workspace_id: row.workspace_id,
    role: row.role,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Missing Authorization header" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
      return jsonResponse({ error: "Supabase env not configured" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const action = body.action;

    switch (action) {
      case "create_workspace":
        return await handleCreateWorkspace(supabase, user.id, body);
      case "create":
        return await handleCreateInvite(supabase, user.id, body);
      case "accept":
        return await handleAcceptInvite(
          supabase,
          user.id,
          user.email ?? "",
          body,
        );
      default:
        return jsonResponse(
          { error: `Unknown action: ${String(action)}` },
          400,
        );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return jsonResponse({ error: message }, 500);
  }
});
