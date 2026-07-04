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
  title_encrypted: string;
  content_encrypted: string | null;
  metadata_encrypted: string | null;
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

async function toDecryptedDocument(row: DocumentRow) {
  const title = await decryptField(row.title_encrypted);
  const content = row.content_encrypted
    ? await decryptField(row.content_encrypted)
    : "";
  const metadata = await decryptMetadata(row.metadata_encrypted);

  return {
    id: row.bridge_document_id,
    rowId: row.id,
    title,
    content,
    metadata,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function toListDocument(row: DocumentRow) {
  const title = await decryptField(row.title_encrypted);

  return {
    id: row.bridge_document_id,
    rowId: row.id,
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

  if (typeof bridgeDocumentId !== "string" || !bridgeDocumentId.trim()) {
    return jsonResponse({ error: "bridge_document_id is required" }, 400);
  }
  if (typeof title !== "string") {
    return jsonResponse({ error: "title is required" }, 400);
  }
  if (typeof content !== "string") {
    return jsonResponse({ error: "content is required" }, 400);
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

  const { data, error } = await supabase
    .from("documents")
    .upsert(
      {
        user_id: userId,
        bridge_document_id: bridgeDocumentId,
        title_encrypted: await encryptField(title),
        content_encrypted: await encryptField(content),
        metadata_encrypted: await encryptMetadata(metadata),
        status,
      },
      { onConflict: "user_id,bridge_document_id" },
    )
    .select("*")
    .single();

  if (error || !data) {
    return jsonResponse(
      { error: error?.message ?? "Failed to create document" },
      500,
    );
  }

  return jsonResponse({
    document: await toDecryptedDocument(data as DocumentRow),
  });
}

async function handleUpdate(
  supabase: SupabaseClient,
  body: Record<string, unknown>,
) {
  const bridgeDocumentId = body.bridge_document_id;
  if (typeof bridgeDocumentId !== "string" || !bridgeDocumentId.trim()) {
    return jsonResponse({ error: "bridge_document_id is required" }, 400);
  }

  const { data: existing, error: fetchError } = await supabase
    .from("documents")
    .select("*")
    .eq("bridge_document_id", bridgeDocumentId)
    .maybeSingle();

  if (fetchError) {
    return jsonResponse({ error: fetchError.message }, 500);
  }
  if (!existing) {
    return jsonResponse({ error: "Document not found" }, 404);
  }

  const row = existing as DocumentRow;
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

  if (Object.keys(updatePayload).length === 0) {
    return jsonResponse({ error: "No fields to update" }, 400);
  }

  const { data, error } = await supabase
    .from("documents")
    .update(updatePayload)
    .eq("bridge_document_id", bridgeDocumentId)
    .select("*")
    .single();

  if (error || !data) {
    return jsonResponse(
      { error: error?.message ?? "Failed to update document" },
      500,
    );
  }

  return jsonResponse({
    document: await toDecryptedDocument(data as DocumentRow),
  });
}

async function handleGet(
  supabase: SupabaseClient,
  body: Record<string, unknown>,
) {
  const bridgeDocumentId = body.bridge_document_id;
  if (typeof bridgeDocumentId !== "string" || !bridgeDocumentId.trim()) {
    return jsonResponse({ error: "bridge_document_id is required" }, 400);
  }

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("bridge_document_id", bridgeDocumentId)
    .maybeSingle();

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }
  if (!data) {
    return jsonResponse({ document: null });
  }

  return jsonResponse({
    document: await toDecryptedDocument(data as DocumentRow),
  });
}

async function handleList(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  const documents = await Promise.all(
    ((data ?? []) as DocumentRow[]).map((row) => toListDocument(row)),
  );

  return jsonResponse({ documents });
}

async function handleDelete(
  supabase: SupabaseClient,
  body: Record<string, unknown>,
) {
  const bridgeDocumentId = body.bridge_document_id;
  if (typeof bridgeDocumentId !== "string" || !bridgeDocumentId.trim()) {
    return jsonResponse({ error: "bridge_document_id is required" }, 400);
  }

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("bridge_document_id", bridgeDocumentId);

  if (error) {
    return jsonResponse({ error: error.message }, 500);
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
        return await handleUpdate(supabase, body);
      case "get":
        return await handleGet(supabase, body);
      case "list":
        return await handleList(supabase);
      case "delete":
        return await handleDelete(supabase, body);
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
