import { supabase } from "@/lib/supabase";
import type { Database, Json } from "@/lib/database.types";

type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];

export type DocumentStatus = "new" | "in_progress" | "reviewed";

export interface DocumentEntity {
  text: string;
  label: string;
  confidence: number;
  start: number;
  end: number;
}

export interface DocumentQaEntry {
  question: string;
  answer: string;
  sources: Array<{ text: string; score: number; start: number; end: number }>;
}

export interface DocumentMetadata {
  page_count?: number;
  entities?: DocumentEntity[];
  qa_history?: DocumentQaEntry[];
  uploaded_at?: number;
  last_accessed_at?: number;
}

/** UI-facing document shape — `id` is the bridge digest for ?doc= URLs. */
export interface StoredDocument {
  id: string;
  rowId: string;
  filename: string;
  full_text: string;
  page_count: number;
  status: DocumentStatus;
  entities: DocumentEntity[];
  qaHistory: DocumentQaEntry[];
  uploadedAt: number;
  lastAccessedAt: number;
}

export interface CreateDocumentOptions {
  bridgeDocumentId: string;
  metadata?: DocumentMetadata;
  status?: DocumentStatus;
}

export interface DocumentPatch {
  title?: string;
  content?: string;
  metadata?: DocumentMetadata;
  status?: DocumentStatus;
}

function parseStatus(value: string | null | undefined): DocumentStatus {
  if (value === "in_progress" || value === "reviewed") return value;
  return "new";
}

function rowToStoredDocument(row: DocumentRow): StoredDocument {
  const meta = (row.metadata as DocumentMetadata | null) ?? {};
  return {
    id: row.bridge_document_id,
    rowId: row.id,
    filename: row.title ?? "",
    full_text: row.content ?? "",
    page_count: meta.page_count ?? 0,
    status: parseStatus(row.status),
    entities: meta.entities ?? [],
    qaHistory: meta.qa_history ?? [],
    uploadedAt:
      meta.uploaded_at ?? new Date(row.created_at).getTime(),
    lastAccessedAt:
      meta.last_accessed_at ?? new Date(row.updated_at).getTime(),
  };
}

function mergeMetadata(
  existing: DocumentMetadata,
  patch: DocumentMetadata,
): DocumentMetadata {
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

async function requireUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error("Not authenticated");
  }
  return user.id;
}

export async function createDocument(
  title: string,
  content: string,
  options: CreateDocumentOptions,
): Promise<StoredDocument> {
  const userId = await requireUserId();
  const now = Date.now();
  const metadata = mergeMetadata(
    { uploaded_at: now, last_accessed_at: now },
    options.metadata ?? {},
  );

  const { data, error } = await supabase
    .from("documents")
    .upsert(
      {
        user_id: userId,
        bridge_document_id: options.bridgeDocumentId,
        title,
        content,
        metadata: metadata as Json,
        status: options.status ?? "new",
      },
      { onConflict: "user_id,bridge_document_id" },
    )
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create document");
  }

  return rowToStoredDocument(data);
}

export async function listDocuments(): Promise<StoredDocument[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(rowToStoredDocument);
}

export async function getDocument(
  bridgeDocumentId: string,
): Promise<StoredDocument | null> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("bridge_document_id", bridgeDocumentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? rowToStoredDocument(data) : null;
}

export async function updateDocument(
  bridgeDocumentId: string,
  patch: DocumentPatch,
): Promise<StoredDocument> {
  const { data: row, error: fetchError } = await supabase
    .from("documents")
    .select("*")
    .eq("bridge_document_id", bridgeDocumentId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }
  if (!row) {
    throw new Error("Document not found");
  }

  const existingMeta = (row.metadata as DocumentMetadata | null) ?? {};
  const mergedMetadata = patch.metadata
    ? mergeMetadata(existingMeta, patch.metadata)
    : existingMeta;

  const { data, error } = await supabase
    .from("documents")
    .update({
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.content !== undefined ? { content: patch.content } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      metadata: mergedMetadata as Json,
    })
    .eq("bridge_document_id", bridgeDocumentId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update document");
  }

  return rowToStoredDocument(data);
}

export async function deleteDocument(
  bridgeDocumentId: string,
): Promise<void> {
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("bridge_document_id", bridgeDocumentId);

  if (error) {
    throw new Error(error.message);
  }
}

/** Upsert helper used by existing upload/save flows. */
export async function saveDocument(
  doc: Omit<StoredDocument, "rowId"> & { rowId?: string },
): Promise<StoredDocument> {
  return createDocument(doc.filename, doc.full_text, {
    bridgeDocumentId: doc.id,
    status: doc.status,
    metadata: {
      page_count: doc.page_count,
      entities: doc.entities,
      qa_history: doc.qaHistory,
      uploaded_at: doc.uploadedAt,
      last_accessed_at: doc.lastAccessedAt,
    },
  });
}

export async function updateDocumentStatus(
  bridgeDocumentId: string,
  status: DocumentStatus,
): Promise<StoredDocument> {
  return updateDocument(bridgeDocumentId, {
    status,
    metadata: { last_accessed_at: Date.now() },
  });
}
