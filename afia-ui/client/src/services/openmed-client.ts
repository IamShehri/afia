export const BASE_URL = "http://127.0.0.1:8765";

export interface OpenMedEntity {
  text: string;
  label: string;
  confidence: number;
  start: number;
  end: number;
}

export interface AnalyzeResult {
  text: string;
  model: string;
  processing_time: number;
  timestamp: string;
  entities: OpenMedEntity[];
}

export interface DeidentifyResult {
  original: string;
  deidentified: string;
}

export interface ModelGroup {
  ner: { id: string; name: string }[];
  pii: { id: string; name: string }[];
  zeroshot: { id: string; name: string }[];
  other: { id: string; name: string }[];
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function listModels(): Promise<ModelGroup> {
  return getModels();
}

export async function analyzeText(text: string, model?: string): Promise<AnalyzeResult> {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, model }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Analysis failed: ${detail || res.statusText}`);
  }
  return res.json();
}

export async function extractPII(text: string): Promise<AnalyzeResult> {
  const res = await fetch(`${BASE_URL}/extract-pii`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("PII extraction failed");
  return res.json();
}

export async function deidentifyText(
  text: string,
  language = "en"
): Promise<DeidentifyResult> {
  const res = await fetch(`${BASE_URL}/deidentify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });
  if (!res.ok) throw new Error("De-identification failed");
  return res.json();
}

export interface DocumentPage {
  page_number: number;
  text: string;
  char_start: number;
  char_end: number;
  width: number;
  height: number;
}

export interface UploadedDocument {
  document_id: string;
  filename: string;
  page_count: number;
  full_text: string;
  pages: DocumentPage[];
}

export interface DocumentEntity {
  text: string;
  label: string;
  confidence: number;
  start: number;
  end: number;
}

export interface DocumentAnalysisResult {
  text: string;
  entities: DocumentEntity[];
  chunk_count: number;
  model_used?: string | null;
}

export async function uploadDocument(file: File): Promise<UploadedDocument> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    let message = "Upload failed";
    try {
      const body = (await res.json()) as { detail?: string };
      if (typeof body.detail === "string" && body.detail.length > 0) {
        message = body.detail;
      }
    } catch {
      /* use default message */
    }
    throw new Error(message);
  }
  return res.json();
}

/** @deprecated Prefer uploadDocument — kept for callers not yet migrated. */
export async function uploadPDF(file: File): Promise<UploadedDocument> {
  return uploadDocument(file);
}

export async function analyzeDocument(
  text: string,
  chunkSize = 3000,
  model?: string
): Promise<DocumentAnalysisResult> {
  const res = await fetch(`${BASE_URL}/analyze-document`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, chunk_size: chunkSize, model }),
  });
  if (!res.ok) {
    let message = "Document analysis failed";
    try {
      const body = (await res.json()) as {
        error?: string;
        model?: string;
        detail?: string;
      };
      if (body.error === "model_unavailable" && body.model) {
        message = `Model unavailable: ${body.model}`;
      } else if (typeof body.detail === "string" && body.detail.length > 0) {
        message = body.detail;
      }
    } catch {
      /* use default message */
    }
    throw new Error(message);
  }
  return res.json();
}

export interface DocumentSource {
  text: string;
  score: number;
  start: number;
  end: number;
}

export interface DocumentPassage {
  text: string;
  score: number;
  char_start: number;
  char_end: number;
}

export interface AskDocumentResult {
  question: string;
  passages: DocumentPassage[];
  retrieval_model?: string;
}

export function passagesToSources(
  passages: DocumentPassage[],
): DocumentSource[] {
  return passages.map((p) => ({
    text: p.text,
    score: p.score,
    start: p.char_start,
    end: p.char_end,
  }));
}

export interface FhirExportDocMeta {
  title?: string;
  page_count?: number;
  analyzed_with?: string;
  analyzed_at?: string;
}

export interface FhirExportSummary {
  resources_created: Record<string, number>;
  entities_skipped_pii: number;
  entities_unmapped: number;
  entities_skipped_empty?: number;
}

export interface FhirExportResult {
  bundle: Record<string, unknown>;
  summary: FhirExportSummary;
}

export async function exportFhir(
  entities: DocumentEntity[],
  docMeta: FhirExportDocMeta,
): Promise<FhirExportResult> {
  const res = await fetch(`${BASE_URL}/export-fhir`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entities, doc_meta: docMeta }),
  });
  if (!res.ok) {
    let message = "FHIR export failed";
    try {
      const body = (await res.json()) as { detail?: string };
      if (typeof body.detail === "string" && body.detail.length > 0) {
        message = body.detail;
      }
    } catch {
      /* use default message */
    }
    throw new Error(message);
  }
  return res.json();
}

export async function askDocument(
  text: string,
  question: string,
  topK = 3,
  documentId?: string,
): Promise<AskDocumentResult & { sources: DocumentSource[] }> {
  const res = await fetch(`${BASE_URL}/ask-document`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      question,
      top_k: topK,
      ...(documentId ? { document_id: documentId } : {}),
    }),
  });
  if (!res.ok) {
    let message = "Question failed";
    try {
      const body = (await res.json()) as { detail?: string };
      if (typeof body.detail === "string" && body.detail.length > 0) {
        message = body.detail;
      }
    } catch {
      /* use default message */
    }
    throw new Error(message);
  }
  const data = (await res.json()) as AskDocumentResult;
  return {
    ...data,
    sources: passagesToSources(data.passages ?? []),
  };
}

export interface ModelInfo {
  id: string;
  name: string;
}

export interface ModelsCatalog {
  ner: ModelInfo[];
  pii: ModelInfo[];
  zeroshot: ModelInfo[];
  other: ModelInfo[];
}

let modelsCatalogCache: ModelsCatalog | null = null;
let modelsCatalogPromise: Promise<ModelsCatalog> | null = null;

async function fetchModelsFromBridge(): Promise<ModelsCatalog> {
  const res = await fetch(`${BASE_URL}/models`);
  if (!res.ok) throw new Error("Failed to fetch models");
  return res.json();
}

/** Drop session cache so the next getModels() hits the bridge again. */
export function invalidateModelsCatalog(): void {
  modelsCatalogCache = null;
  modelsCatalogPromise = null;
}

export async function getModels(options?: {
  refresh?: boolean;
}): Promise<ModelsCatalog> {
  if (options?.refresh) {
    invalidateModelsCatalog();
  }
  if (modelsCatalogCache) {
    return modelsCatalogCache;
  }
  if (!modelsCatalogPromise) {
    modelsCatalogPromise = fetchModelsFromBridge()
      .then((data) => {
        modelsCatalogCache = data;
        return data;
      })
      .catch((err) => {
        modelsCatalogPromise = null;
        throw err;
      });
  }
  return modelsCatalogPromise;
}

/** Lightweight bridge reachability check — GET /health, no catalog work. */
export async function probeBridgeConnection(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
