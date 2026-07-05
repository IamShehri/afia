import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const IV_LENGTH = 12;
const TAG_LENGTH = 16;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type DocumentRow = {
  id: string;
  bridge_document_id: string;
  user_id: string;
  workspace_id: string | null;
  title_encrypted: string;
  content_encrypted: string | null;
  metadata_encrypted: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type ListRow = {
  id: string;
  bridge_document_id: string;
  workspace_id: string | null;
  title_encrypted: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type MetadataRecord = Record<string, unknown>;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

let cachedKey: CryptoKey | null = null;

async function getAesKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  const raw = Deno.env.get("ENCRYPTION_KEY");
  if (!raw) {
    throw new Error("ENCRYPTION_KEY secret is not configured");
  }

  const keyBytes = base64ToBytes(raw.trim());
  if (keyBytes.length !== 32) {
    throw new Error(
      `ENCRYPTION_KEY must decode to 32 bytes, got ${keyBytes.length}`,
    );
  }

  cachedKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );

  return cachedKey;
}

async function encryptField(plaintext: string): Promise<string> {
  const key = await getAesKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);

  const cipherWithTag = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv, tagLength: TAG_LENGTH * 8 },
      key,
      encoded,
    ),
  );

  const packed = new Uint8Array(iv.length + cipherWithTag.length);
  packed.set(iv, 0);
  packed.set(cipherWithTag, iv.length);

  return bytesToBase64(packed);
}

async function decryptField(ciphertext: string): Promise<string> {
  const key = await getAesKey();
  const packed = base64ToBytes(ciphertext);

  if (packed.length < IV_LENGTH + TAG_LENGTH + 1) {
    throw new Error("Ciphertext too short — corrupt or wrong format");
  }

  const iv = packed.slice(0, IV_LENGTH);
  const cipherWithTag = packed.slice(IV_LENGTH);

  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, tagLength: TAG_LENGTH * 8 },
    key,
    cipherWithTag,
  );

  return new TextDecoder().decode(plainBuffer);
}

async function encryptMetadata(metadata: MetadataRecord): Promise<string> {
  return encryptField(JSON.stringify(metadata));
}

async function decryptMetadata(
  ciphertext: string | null,
): Promise<MetadataRecord> {
  if (!ciphertext) return {};
  const parsed = JSON.parse(await decryptField(ciphertext));
  return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
    ? (parsed as MetadataRecord)
    : {};
}

function mergeMetadata(
  existing: MetadataRecord,
  patch: MetadataRecord,
): MetadataRecord {
  const now = Date.now();
  return {
    page_count: patch.page_count ?? existing.page_count ?? 0,
    entities: patch.entities ?? existing.entities ?? [],
    qa_history: patch.qa_history ?? existing.qa_history ?? [],
    uploaded_at: patch.uploaded_at ?? existing.uploaded_at ?? now,
    last_accessed_at:
      patch.last_accessed_at ?? existing.last_accessed_at ?? now,
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function writeAudit(
  supabase: SupabaseClient,
  userId: string,
  action: string,
  resourceType: "document" | "workspace",
  resourceId: string,
): Promise<void> {
  try {
    const { error } = await supabase.from("audit_log").insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
    });
    if (error) {
      console.error("[audit] insert failed:", error.message);
    }
  } catch (err) {
    console.error("[audit] insert failed:", err);
  }
}

async function isWorkspaceMember(
  supabase: SupabaseClient,
  workspaceId: string,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_workspace_member", {
    ws: workspaceId,
    uid: userId,
  });
  if (error) {
    console.error("[auth] is_workspace_member:", error.message);
    return false;
  }
  return data === true;
}

async function isWorkspaceOwner(
  supabase: SupabaseClient,
  workspaceId: string,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_workspace_owner", {
    ws: workspaceId,
    uid: userId,
  });
  if (error) {
    console.error("[auth] is_workspace_owner:", error.message);
    return false;
  }
  return data === true;
}

async function hasWorkspaceRole(
  supabase: SupabaseClient,
  workspaceId: string,
  userId: string,
  allowedRoles: string[],
): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_workspace_role", {
    ws: workspaceId,
    uid: userId,
    allowed_roles: allowedRoles,
  });
  if (error) {
    console.error("[auth] has_workspace_role:", error.message);
    return false;
  }
  return data === true;
}

/** Defense-in-depth read check — mirrors documents SELECT RLS. */
async function canReadDocument(
  supabase: SupabaseClient,
  row: DocumentRow,
  userId: string,
): Promise<boolean> {
  if (row.user_id === userId) return true;
  if (row.workspace_id) {
    return isWorkspaceMember(supabase, row.workspace_id, userId);
  }
  return false;
}

/** Defense-in-depth update check — mirrors documents UPDATE RLS. */
async function canUpdateDocument(
  supabase: SupabaseClient,
  row: DocumentRow,
  userId: string,
): Promise<boolean> {
  if (row.user_id === userId) return true;
  if (row.workspace_id) {
    return hasWorkspaceRole(supabase, row.workspace_id, userId, [
      "owner",
      "editor",
    ]);
  }
  return false;
}

/** Defense-in-depth delete check — mirrors documents DELETE RLS. */
async function canDeleteDocument(
  supabase: SupabaseClient,
  row: DocumentRow,
  userId: string,
): Promise<boolean> {
  if (row.user_id === userId) return true;
  if (row.workspace_id) {
    return isWorkspaceOwner(supabase, row.workspace_id, userId);
  }
  return false;
}

function parseOptionalWorkspaceId(
  value: unknown,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

/**
 * Validates moving a document between personal/workspace contexts.
 * Edge Function enforces moves explicitly (RLS allows column change without this).
 */
async function validateWorkspaceMove(
  supabase: SupabaseClient,
  row: DocumentRow,
  userId: string,
  nextWorkspaceId: string | null,
): Promise<string | null> {
  if (nextWorkspaceId === row.workspace_id) return null;

  const sourceId = row.workspace_id;

  if (sourceId === null) {
    if (row.user_id !== userId) {
      return "Only the document creator can move a personal document";
    }
  } else {
    const canLeave = row.user_id === userId ||
      await hasWorkspaceRole(supabase, sourceId, userId, ["owner", "editor"]);
    if (!canLeave) {
      return "Insufficient permission to move this workspace document";
    }
  }

  if (nextWorkspaceId !== null) {
    const canEnter = row.user_id === userId ||
      await hasWorkspaceRole(supabase, nextWorkspaceId, userId, [
        "owner",
        "editor",
      ]);
    if (!canEnter) {
      return "Insufficient permission to move document into that workspace";
    }
  } else if (sourceId !== null) {
    const canPersonalize = row.user_id === userId ||
      await isWorkspaceOwner(supabase, sourceId, userId);
    if (!canPersonalize) {
      return "Only the creator or workspace owner can move a document to personal";
    }
  }

  return null;
}

function parseDocumentId(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

type ResolveDocumentResult =
  | { status: "found"; row: DocumentRow }
  | { status: "not_found" }
  | { status: "ambiguous"; document_ids: string[] }
  | { status: "error"; message: string };

/**
 * Resolves a document row by bridge digest. Uniqueness is (user_id, bridge_document_id)
 * only — the digest alone can match multiple accessible rows in a shared workspace.
 *
 * Resolution order:
 * 1. document_id (uuid) when provided — exact row
 * 2. Caller's own row (user_id = caller) when present among accessible matches
 * 3. workspace_id hint when provided (null = personal)
 * 4. Single accessible match
 * 5. Otherwise ambiguous → caller must pass document_id and/or workspace_id
 */
async function resolveDocument(
  supabase: SupabaseClient,
  userId: string,
  lookup: {
    bridgeDocumentId: string;
    documentId?: string;
    workspaceId?: string | null;
  },
): Promise<ResolveDocumentResult> {
  const documentId = lookup.documentId;

  if (documentId) {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .maybeSingle();

    if (error) return { status: "error", message: error.message };
    if (!data) return { status: "not_found" };

    const row = data as DocumentRow;
    if (row.bridge_document_id !== lookup.bridgeDocumentId) {
      return { status: "not_found" };
    }
    if (!(await canReadDocument(supabase, row, userId))) {
      return { status: "not_found" };
    }
    return { status: "found", row };
  }

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("bridge_document_id", lookup.bridgeDocumentId);

  if (error) return { status: "error", message: error.message };

  const accessible: DocumentRow[] = [];
  for (const row of (data ?? []) as DocumentRow[]) {
    if (await canReadDocument(supabase, row, userId)) {
      accessible.push(row);
    }
  }

  if (accessible.length === 0) return { status: "not_found" };
  if (accessible.length === 1) return { status: "found", row: accessible[0]! };

  const ownRow = accessible.find((row) => row.user_id === userId);
  if (ownRow) return { status: "found", row: ownRow };

  if (lookup.workspaceId !== undefined) {
    const hinted = accessible.filter((row) =>
      lookup.workspaceId === null
        ? row.workspace_id === null
        : row.workspace_id === lookup.workspaceId
    );
    if (hinted.length === 1) return { status: "found", row: hinted[0]! };
  }

  return {
    status: "ambiguous",
    document_ids: accessible.map((row) => row.id),
  };
}

async function resolveDocumentFromBody(
  supabase: SupabaseClient,
  userId: string,
  body: Record<string, unknown>,
): Promise<ResolveDocumentResult | Response> {
  const bridgeDocumentId = body.bridge_document_id;
  if (typeof bridgeDocumentId !== "string" || !bridgeDocumentId.trim()) {
    return jsonResponse({ error: "bridge_document_id is required" }, 400);
  }

  const workspaceHint = "workspace_id" in body
    ? parseOptionalWorkspaceId(body.workspace_id)
    : undefined;

  const result = await resolveDocument(supabase, userId, {
    bridgeDocumentId: bridgeDocumentId.trim(),
    documentId: parseDocumentId(body.document_id),
    workspaceId: workspaceHint,
  });

  if (result.status === "ambiguous") {
    return jsonResponse(
      {
        error:
          "Multiple documents match this digest — pass document_id and/or workspace_id",
        ambiguous: true,
        document_ids: result.document_ids,
      },
      409,
    );
  }

  if (result.status === "error") {
    return jsonResponse({ error: result.message }, 500);
  }

  return result;
}

async function toDecryptedDocument(row: DocumentRow) {
  const title = await decryptField(row.title_encrypted);
  const content = row.content_encrypted
    ? await decryptField(row.content_encrypted)
    : "";
  const metadata = await decryptMetadata(row.metadata_encrypted);

  return {
    id: row.bridge_document_id,
    rowId: row.id,
    workspace_id: row.workspace_id,
    title,
    content,
    metadata,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function toListDocument(row: ListRow) {
  const title = await decryptField(row.title_encrypted);

  return {
    id: row.bridge_document_id,
    rowId: row.id,
    workspace_id: row.workspace_id,
    title,
    content: "",
    metadata: {},
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function handleCreate(
  supabase: SupabaseClient,
  userId: string,
  body: Record<string, unknown>,
) {
  const bridgeDocumentId = body.bridge_document_id;
  const title = body.title;
  const content = body.content;
  const metadataInput = body.metadata;
  const status = typeof body.status === "string" ? body.status : "new";
  const workspaceId = parseOptionalWorkspaceId(body.workspace_id);

  if (typeof bridgeDocumentId !== "string" || !bridgeDocumentId.trim()) {
    return jsonResponse({ error: "bridge_document_id is required" }, 400);
  }
  if (typeof title !== "string") {
    return jsonResponse({ error: "title is required" }, 400);
  }
  if (typeof content !== "string") {
    return jsonResponse({ error: "content is required" }, 400);
  }

  if (workspaceId) {
    const allowed = await hasWorkspaceRole(supabase, workspaceId, userId, [
      "owner",
      "editor",
    ]);
    if (!allowed) {
      return jsonResponse(
        { error: "Not authorized to create documents in this workspace" },
        403,
      );
    }
  }

  const now = Date.now();
  const metadata = mergeMetadata(
    { uploaded_at: now, last_accessed_at: now },
    typeof metadataInput === "object" &&
      metadataInput !== null &&
      !Array.isArray(metadataInput)
      ? (metadataInput as MetadataRecord)
      : {},
  );

  const upsertPayload: Record<string, unknown> = {
    user_id: userId,
    bridge_document_id: bridgeDocumentId,
    title_encrypted: await encryptField(title),
    content_encrypted: await encryptField(content),
    metadata_encrypted: await encryptMetadata(metadata),
    status,
  };

  if (workspaceId !== undefined) {
    upsertPayload.workspace_id = workspaceId;
  }

  const { data, error } = await supabase
    .from("documents")
    .upsert(upsertPayload, { onConflict: "user_id,bridge_document_id" })
    .select("*")
    .single();

  if (error || !data) {
    return jsonResponse(
      { error: error?.message ?? "Failed to create document" },
      500,
    );
  }

  const row = data as DocumentRow;
  await writeAudit(supabase, userId, "create", "document", row.id);

  return jsonResponse({
    document: await toDecryptedDocument(row),
  });
}

async function handleUpdate(
  supabase: SupabaseClient,
  userId: string,
  body: Record<string, unknown>,
) {
  const bridgeDocumentId = body.bridge_document_id;
  if (typeof bridgeDocumentId !== "string" || !bridgeDocumentId.trim()) {
    return jsonResponse({ error: "bridge_document_id is required" }, 400);
  }

  const resolved = await resolveDocumentFromBody(supabase, userId, body);
  if (resolved instanceof Response) return resolved;
  if (resolved.status === "not_found") {
    return jsonResponse({ error: "Document not found" }, 404);
  }

  const row = resolved.row;

  if (!(await canUpdateDocument(supabase, row, userId))) {
    return jsonResponse({ error: "Not authorized to update this document" }, 403);
  }

  const updatePayload: Record<string, unknown> = {};

  if (typeof body.title === "string") {
    updatePayload.title_encrypted = await encryptField(body.title);
  }

  if (typeof body.content === "string") {
    updatePayload.content_encrypted = await encryptField(body.content);
  }

  if (typeof body.status === "string") {
    updatePayload.status = body.status;
  }

  const metadataPatch =
    typeof body.metadata === "object" &&
    body.metadata !== null &&
    !Array.isArray(body.metadata)
      ? (body.metadata as MetadataRecord)
      : null;

  if (metadataPatch) {
    const existingMetadata = await decryptMetadata(row.metadata_encrypted);
    const merged = mergeMetadata(existingMetadata, metadataPatch);
    updatePayload.metadata_encrypted = await encryptMetadata(merged);
  }

  const nextWorkspaceId = parseOptionalWorkspaceId(body.workspace_id);
  if (nextWorkspaceId !== undefined) {
    const moveError = await validateWorkspaceMove(
      supabase,
      row,
      userId,
      nextWorkspaceId,
    );
    if (moveError) {
      return jsonResponse({ error: moveError }, 403);
    }
    updatePayload.workspace_id = nextWorkspaceId;
  }

  if (Object.keys(updatePayload).length === 0) {
    return jsonResponse({ error: "No fields to update" }, 400);
  }

  const { data, error } = await supabase
    .from("documents")
    .update(updatePayload)
    .eq("id", row.id)
    .select("*")
    .single();

  if (error || !data) {
    return jsonResponse(
      { error: error?.message ?? "Failed to update document" },
      500,
    );
  }

  const updated = data as DocumentRow;
  await writeAudit(supabase, userId, "update", "document", updated.id);

  if (
    nextWorkspaceId !== undefined &&
    nextWorkspaceId !== row.workspace_id
  ) {
    const targetId = nextWorkspaceId ?? row.workspace_id;
    if (targetId) {
      await writeAudit(supabase, userId, "move", "workspace", targetId);
    }
  }

  return jsonResponse({
    document: await toDecryptedDocument(updated),
  });
}

async function handleGet(
  supabase: SupabaseClient,
  userId: string,
  body: Record<string, unknown>,
) {
  const resolved = await resolveDocumentFromBody(supabase, userId, body);
  if (resolved instanceof Response) return resolved;
  if (resolved.status === "not_found") {
    return jsonResponse({ document: null });
  }

  const row = resolved.row;
  await writeAudit(supabase, userId, "view", "document", row.id);

  return jsonResponse({
    document: await toDecryptedDocument(row),
  });
}

async function handleList(
  supabase: SupabaseClient,
  userId: string,
  body: Record<string, unknown>,
) {
  const workspaceFilter = parseOptionalWorkspaceId(body.workspace_id);

  if (typeof workspaceFilter === "string") {
    if (!(await isWorkspaceMember(supabase, workspaceFilter, userId))) {
      return jsonResponse(
        { error: "Not authorized to list this workspace" },
        403,
      );
    }
  }

  let query = supabase
    .from("documents")
    .select(
      "id, bridge_document_id, workspace_id, title_encrypted, status, created_at, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (workspaceFilter === null) {
    query = query.is("workspace_id", null);
  } else if (typeof workspaceFilter === "string") {
    query = query.eq("workspace_id", workspaceFilter);
  }

  const { data, error } = await query;

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  const documents = await Promise.all(
    ((data ?? []) as ListRow[]).map((row) => toListDocument(row)),
  );

  return jsonResponse({ documents });
}

async function handleDelete(
  supabase: SupabaseClient,
  userId: string,
  body: Record<string, unknown>,
) {
  const resolved = await resolveDocumentFromBody(supabase, userId, body);
  if (resolved instanceof Response) return resolved;
  if (resolved.status === "not_found") {
    return jsonResponse({ ok: true });
  }

  const row = resolved.row;

  if (!(await canDeleteDocument(supabase, row, userId))) {
    return jsonResponse({ error: "Not authorized to delete this document" }, 403);
  }

  const { data, error } = await supabase
    .from("documents")
    .delete()
    .eq("id", row.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  if (data) {
    await writeAudit(supabase, userId, "delete", "document", (data as { id: string }).id);
  }

  return jsonResponse({ ok: true });
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
      case "create":
        return await handleCreate(supabase, user.id, body);
      case "update":
        return await handleUpdate(supabase, user.id, body);
      case "get":
        return await handleGet(supabase, user.id, body);
      case "list":
        return await handleList(supabase, user.id, body);
      case "delete":
        return await handleDelete(supabase, user.id, body);
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
