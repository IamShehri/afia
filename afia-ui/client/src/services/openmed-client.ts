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
  const res = await fetch(`${BASE_URL}/models`);
  if (!res.ok) throw new Error("Failed to fetch models");
  return res.json();
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
}

export async function uploadPDF(file: File): Promise<UploadedDocument> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/upload-pdf`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("PDF upload failed");
  return res.json();
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
  if (!res.ok) throw new Error("Document analysis failed");
  return res.json();
}

export interface DocumentSource {
  text: string;
  score: number;
  start: number;
  end: number;
}

export interface AskDocumentResult {
  question: string;
  answer: string;
  sources: DocumentSource[];
}

export async function askDocument(
  text: string,
  question: string,
  topK = 3
): Promise<AskDocumentResult> {
  const res = await fetch(`${BASE_URL}/ask-document`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, question, top_k: topK }),
  });
  if (!res.ok) throw new Error("Question failed");
  return res.json();
}

export interface ModelInfo {
  id: string;
  name: string;
}

export async function getModels(): Promise<{
  ner: ModelInfo[];
  pii: ModelInfo[];
  zeroshot: ModelInfo[];
  other: ModelInfo[];
}> {
  const res = await fetch(`${BASE_URL}/models`);
  if (!res.ok) throw new Error("Failed to fetch models");
  return res.json();
}
