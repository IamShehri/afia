import { supabase } from "@/lib/supabase";

export type DocumentStatus = "new" | "in_progress" | "reviewed" | "artifact";

export const LIBRARY_GRAPH_ARTIFACT_ID = "afia-artifact-library-graph";
export const LIBRARY_GRAPH_ARTIFACT_TITLE = "Library Entity Graph";

export function isArtifactDocument(doc: Pick<StoredDocument, "status">): boolean {
  return doc.status === "artifact";
}

/** User-visible library rows — excludes synthetic artifact documents. */
export function filterUserDocuments<T extends Pick<StoredDocument, "status">>(
  docs: T[],
): T[] {
  return docs.filter((d) => !isArtifactDocument(d));
}

export interface DocumentEntity {
  text: string;
  label: string;
  confidence: number;
  start: number;
  end: number;
}

export interface DocumentQaEntry {
  question: string;
  /** Legacy generative answer — unused in extractive v1. */
  answer?: string;
  sources: Array<{ text: string; score: number; start: number; end: number }>;
}

export interface GraphElement {
  id: string;
  label: string;
  type: string;
  pinned?: boolean;
  x?: number;
  y?: number;
  hidden?: boolean;
}

export interface GraphConnection {
  from: string;
  to: string;
  weight: number;
}

export interface LibraryGraphSpec {
  elements: GraphElement[];
  connections: GraphConnection[];
}

export interface DocumentMetadata {
  page_count?: number;
  entities?: DocumentEntity[];
  qa_history?: DocumentQaEntry[];
  model_used?: string;
  uploaded_at?: number;
  last_accessed_at?: number;
  /** Persisted entity graph layout (Analytics Lab artifact). */
  graph_spec?: LibraryGraphSpec;
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
  modelUsed?: string;
  uploadedAt: number;
  lastAccessedAt: number;
  metadata?: DocumentMetadata;
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

/** Decrypted document payload returned by documents-crypto Edge Function. */
interface CryptoDocument {
  id: string;
  rowId: string;
  title: string;
  content: string;
  metadata: DocumentMetadata;
  status: string;
  created_at: string;
  updated_at: string;
}

function parseStatus(value: string | null | undefined): DocumentStatus {
  if (value === "in_progress" || value === "reviewed" || value === "artifact") {
    return value;
  }
  return "new";
}

function cryptoDocToStored(doc: CryptoDocument): StoredDocument {
  const meta = doc.metadata ?? {};
  return {
    id: doc.id,
    rowId: doc.rowId,
    filename: doc.title,
    full_text: doc.content,
    page_count: meta.page_count ?? 0,
    status: parseStatus(doc.status),
    entities: meta.entities ?? [],
    qaHistory: meta.qa_history ?? [],
    modelUsed: meta.model_used,
    uploadedAt:
      meta.uploaded_at ?? new Date(doc.created_at).getTime(),
    lastAccessedAt:
      meta.last_accessed_at ?? new Date(doc.updated_at).getTime(),
    metadata: meta,
  };
}

async function invokeDocumentsCrypto<T>(
  body: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke("documents-crypto", {
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

export async function createDocument(
  title: string,
  content: string,
  options: CreateDocumentOptions,
): Promise<StoredDocument> {
  const now = Date.now();
  const metadata: DocumentMetadata = {
    uploaded_at: now,
    last_accessed_at: now,
    ...options.metadata,
  };

  const { document } = await invokeDocumentsCrypto<{ document: CryptoDocument }>({
    action: "create",
    bridge_document_id: options.bridgeDocumentId,
    title,
    content,
    metadata,
    status: options.status ?? "new",
  });

  return cryptoDocToStored(document);
}

export async function listDocuments(): Promise<StoredDocument[]> {
  const { documents } = await invokeDocumentsCrypto<{
    documents: CryptoDocument[];
  }>({ action: "list" });

  return (documents ?? []).map(cryptoDocToStored);
}

export async function getDocument(
  bridgeDocumentId: string,
): Promise<StoredDocument | null> {
  const { document } = await invokeDocumentsCrypto<{
    document: CryptoDocument | null;
  }>({
    action: "get",
    bridge_document_id: bridgeDocumentId,
  });

  return document ? cryptoDocToStored(document) : null;
}

export async function updateDocument(
  bridgeDocumentId: string,
  patch: DocumentPatch,
): Promise<StoredDocument> {
  const body: Record<string, unknown> = {
    action: "update",
    bridge_document_id: bridgeDocumentId,
  };

  if (patch.title !== undefined) body.title = patch.title;
  if (patch.content !== undefined) body.content = patch.content;
  if (patch.status !== undefined) body.status = patch.status;
  if (patch.metadata !== undefined) body.metadata = patch.metadata;

  const { document } = await invokeDocumentsCrypto<{ document: CryptoDocument }>(
    body,
  );

  return cryptoDocToStored(document);
}

export async function deleteDocument(
  bridgeDocumentId: string,
): Promise<void> {
  await invokeDocumentsCrypto<{ ok: boolean }>({
    action: "delete",
    bridge_document_id: bridgeDocumentId,
  });
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
      model_used: doc.modelUsed,
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
