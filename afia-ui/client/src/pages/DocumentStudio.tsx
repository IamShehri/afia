import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, SectionLabel } from "@/components/primitives";
import { cn } from "@/lib/utils";
import {
  uploadPDF,
  analyzeDocument,
  askDocument,
  BASE_URL,
  type UploadedDocument,
  type DocumentAnalysisResult,
  type DocumentEntity,
  type DocumentSource,
} from "@/services/openmed-client";
import {
  saveDocument,
  getDocument,
  updateDocumentStatus,
  type StoredDocument,
  type DocumentStatus,
} from "@/lib/documents";
import { logAction } from "@/lib/audit";
import { resolveAnalysisModel } from "@/services/model-preference";
import { ShareMenu } from "@/components/ShareMenu";
import { APP_PUBLIC_URL } from "@/const";
import { buildDocumentShareText } from "@/lib/social-share";
import {
  FileText,
  Upload,
  Loader2,
  AlertCircle,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Send,
  Tags,
  Layers,
  TrendingUp,
  Download,
  type LucideIcon,
} from "lucide-react";

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function entitiesToCSV(entities: DocumentEntity[]): string {
  const header = "Text,Label,Confidence,Start,End\n";
  const rows = entities
    .map((e) => {
      const escapedText = `"${e.text.replace(/"/g, '""')}"`;
      return `${escapedText},${e.label},${(e.confidence * 100).toFixed(1)}%,${e.start},${e.end}`;
    })
    .join("\n");
  return header + rows;
}

interface QaEntry {
  question: string;
  answer: string;
  sources: DocumentSource[];
}

const STATUS_STYLES: Record<DocumentStatus, string> = {
  new: "border-info/25 bg-info/10 text-info",
  in_progress: "border-warning/25 bg-warning/10 text-warning",
  reviewed: "border-success/25 bg-success/10 text-success",
};

/* AFIA answer bubble with an expandable Sources section. */
function AnswerBubble({ entry }: { entry: QaEntry }) {
  const [showSources, setShowSources] = useState(false);
  return (
    <div className="rounded-lg border border-hairline bg-surface p-3">
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {entry.answer}
      </p>
      {entry.sources.length > 0 && (
        <div className="mt-2 border-t border-hairline pt-2">
          <button
            type="button"
            onClick={() => setShowSources((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground"
            aria-expanded={showSources}
          >
            {showSources ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
            Sources ({entry.sources.length})
          </button>
          {showSources && (
            <div className="mt-2 space-y-1.5">
              {entry.sources.map((s, i) => (
                <div
                  key={`${s.start}-${s.end}-${i}`}
                  className="flex items-start gap-2 rounded-md border border-hairline bg-background px-2.5 py-1.5"
                >
                  <span className="flex-1 text-xs leading-relaxed">
                    {s.text}
                  </span>
                  <span className="shrink-0 rounded border border-ai/25 bg-ai/10 px-1.5 py-0.5 font-mono text-[11px] font-medium text-ai">
                    {(s.score * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* Renders document text with detected entity spans highlighted inline.
   Same visual style as Assistant.tsx. */
function HighlightedText({
  text,
  entities,
}: {
  text: string;
  entities: DocumentEntity[];
}) {
  const sorted = [...entities].sort((a, b) => a.start - b.start);
  const nodes: ReactNode[] = [];
  let cursor = 0;

  sorted.forEach((e, i) => {
    if (e.start < cursor || e.start > text.length) return;
    if (e.start > cursor) {
      nodes.push(<span key={`t${i}`}>{text.slice(cursor, e.start)}</span>);
    }
    nodes.push(
      <span
        key={`e${i}`}
        title={`${e.label} · ${(e.confidence * 100).toFixed(1)}%`}
        className="rounded bg-ai/15 px-0.5 text-ai"
      >
        {text.slice(e.start, e.end)}
      </span>,
    );
    cursor = e.end;
  });
  if (cursor < text.length) {
    nodes.push(<span key="tail">{text.slice(cursor)}</span>);
  }

  return (
    <p className="font-mono text-xs leading-relaxed whitespace-pre-wrap">
      {nodes}
    </p>
  );
}

function EntityGroup({
  label,
  entities,
}: {
  label: string;
  entities: DocumentEntity[];
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-md border border-hairline bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left"
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown className="size-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-3.5 text-muted-foreground" />
        )}
        <span className="rounded border border-ai/25 bg-ai/10 px-1.5 py-0.5 text-[11px] font-medium text-ai">
          {label}
        </span>
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          {entities.length}
        </span>
      </button>
      {open && (
        <div className="space-y-1 border-t border-hairline px-2.5 py-2">
          {entities.map((e, i) => (
            <div
              key={`${e.start}-${e.end}-${i}`}
              className="flex items-center gap-2"
            >
              <span className="flex-1 truncate text-sm">{e.text}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {(e.confidence * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {label}
            </div>
            <div className="mt-1 text-2xl font-semibold">{value}</div>
          </div>
          <Icon className="size-4 shrink-0 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DocumentStudio() {
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDocument | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<DocumentAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [qaHistory, setQaHistory] = useState<QaEntry[]>([]);
  const [status, setStatus] = useState<DocumentStatus>("new");
  const inputRef = useRef<HTMLInputElement>(null);
  const search = useSearch();

  const groupedEntities = useMemo(() => {
    const groups = new Map<string, DocumentEntity[]>();
    for (const e of analysisResult?.entities ?? []) {
      const list = groups.get(e.label) ?? [];
      list.push(e);
      groups.set(e.label, list);
    }
    return [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [analysisResult]);

  const wordCount = useMemo(() => {
    if (!uploadedDoc) return 0;
    return uploadedDoc.full_text.trim().split(/\s+/).filter(Boolean).length;
  }, [uploadedDoc]);

  // Restore a previously stored document when navigated to with ?doc=<id>.
  useEffect(() => {
    const params = new URLSearchParams(search);
    const docId = params.get("doc");
    if (!docId) return;
    let active = true;
    getDocument(docId)
      .then((stored: StoredDocument | null) => {
        if (!active || !stored) return;
        setUploadedDoc({
          document_id: stored.id,
          filename: stored.filename,
          page_count: stored.page_count,
          full_text: stored.full_text,
          pages: [],
        });
        setAnalysisResult({
          text: stored.full_text,
          entities: stored.entities,
          chunk_count: 0,
        });
        setQaHistory(stored.qaHistory);
        setStatus(stored.status ?? "new");
      })
      .catch(() => {
        /* ignore restore failures — fall back to the upload dropzone */
      });
    return () => {
      active = false;
    };
  }, [search]);

  const reset = () => {
    setUploadedDoc(null);
    setUploading(false);
    setAnalyzing(false);
    setAnalysisResult(null);
    setError(null);
    setDragActive(false);
    setQuestion("");
    setAsking(false);
    setQaHistory([]);
    setStatus("new");
  };

  const handleExportCSV = () => {
    if (!analysisResult || !uploadedDoc) return;
    const csv = entitiesToCSV(analysisResult.entities);
    const filename =
      uploadedDoc.filename.replace(/\.pdf$/i, "") + "_entities.csv";
    downloadFile(csv, filename, "text/csv");
    logAction("export", "document", uploadedDoc.document_id);
  };

  const handleExportJSON = () => {
    if (!analysisResult || !uploadedDoc) return;
    const data = {
      document: uploadedDoc.filename,
      page_count: uploadedDoc.page_count,
      analyzed_at: new Date().toISOString(),
      entities: analysisResult.entities,
      qa_history: qaHistory,
    };
    const json = JSON.stringify(data, null, 2);
    const filename =
      uploadedDoc.filename.replace(/\.pdf$/i, "") + "_analysis.json";
    downloadFile(json, filename, "application/json");
    logAction("export", "document", uploadedDoc.document_id);
  };

  const handleAsk = async () => {
    const q = question.trim();
    if (!q || !uploadedDoc || asking) return;
    setAsking(true);
    setError(null);
    try {
      const result = await askDocument(uploadedDoc.full_text, q);
      const newEntry: QaEntry = {
        question: q,
        answer: result.answer,
        sources: result.sources,
      };
      setQaHistory((prev) => [...prev, newEntry]);
      setQuestion("");
      const nextStatus: DocumentStatus =
        status === "reviewed" ? "reviewed" : "in_progress";
      setStatus(nextStatus);
      if (uploadedDoc) {
        await saveDocument({
          id: uploadedDoc.document_id,
          filename: uploadedDoc.filename,
          full_text: uploadedDoc.full_text,
          page_count: uploadedDoc.page_count,
          status: nextStatus,
          entities: analysisResult?.entities || [],
          qaHistory: [...qaHistory, newEntry],
          uploadedAt: Date.now(),
          lastAccessedAt: Date.now(),
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Question failed");
    } finally {
      setAsking(false);
    }
  };

  const handleFile = async (file: File) => {
    console.log("[DocumentStudio] handleFile called:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      return;
    }
    setError(null);
    setAnalysisResult(null);
    setUploading(true);
    try {
      console.log("[DocumentStudio] uploading PDF to:", `${BASE_URL}/upload-pdf`);
      let doc: UploadedDocument;
      try {
        doc = await uploadPDF(file);
      } catch (uploadErr) {
        console.error("[DocumentStudio] uploadPDF failed:", uploadErr);
        throw uploadErr;
      }
      setUploadedDoc(doc);
      setUploading(false);
      setAnalyzing(true);
      try {
        const result = await analyzeDocument(
          doc.full_text,
          3000,
          await resolveAnalysisModel(),
        );
        setAnalysisResult(result);
        setStatus("new");
        await saveDocument({
          id: doc.document_id,
          filename: doc.filename,
          full_text: doc.full_text,
          page_count: doc.page_count,
          status: "new",
          entities: result.entities,
          qaHistory: [],
          uploadedAt: Date.now(),
          lastAccessedAt: Date.now(),
        });
      } finally {
        setAnalyzing(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const onDrop = (ev: React.DragEvent) => {
    ev.preventDefault();
    setDragActive(false);
    const file = ev.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const entities = analysisResult?.entities ?? [];
  const entityCount = entities.length;
  const uniqueLabelCount = groupedEntities.length;
  const avgConfidence =
    entities.length > 0
      ? entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length
      : 0;
  const maxLabelCount = groupedEntities.length > 0 ? groupedEntities[0][1].length : 0;

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-hairline px-6 py-4">
        <PageHeader
          title="Document Studio"
          subtitle="Upload clinical PDFs and detect entities across the full document"
        />
      </div>

      <div className="flex-1 overflow-auto p-6">
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!uploadedDoc ? (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                console.log("[DocumentStudio] input onChange fired:", file);
                if (file) void handleFile(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => {
                console.log("[DocumentStudio] drop zone clicked, opening file dialog");
                inputRef.current?.click();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              className={cn(
                "flex min-h-80 w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 text-center transition-colors",
                dragActive
                  ? "border-ai bg-ai/5"
                  : "border-hairline hover:border-ai/50 hover:bg-surface",
              )}
            >
              {uploading ? (
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="size-8 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {uploading ? "Uploading…" : "Drop a PDF here or click to browse"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF files only
                </p>
              </div>
            </button>
          </>
        ) : (
          <div className="space-y-4">
            {/* Document header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileText className="size-5 shrink-0 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{uploadedDoc.filename}</p>
                    <select
                      value={status}
                      onChange={(e) => {
                        const next = e.target.value as DocumentStatus;
                        setStatus(next);
                        void updateDocumentStatus(
                          uploadedDoc.document_id,
                          next,
                        );
                      }}
                      aria-label="Review status"
                      className={cn(
                        "rounded-md border px-1.5 py-0.5 text-xs font-medium",
                        STATUS_STYLES[status],
                      )}
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="reviewed">Reviewed</option>
                    </select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {uploadedDoc.page_count} pages ·{" "}
                    {uploadedDoc.full_text.length.toLocaleString()} chars
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {analysisResult && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportCSV}
                    >
                      <Download className="size-4" />
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportJSON}
                    >
                      <Download className="size-4" />
                      Export JSON
                    </Button>
                    <ShareMenu
                      text={buildDocumentShareText(
                        entityCount,
                        uploadedDoc.page_count,
                      )}
                      url={APP_PUBLIC_URL}
                    />
                  </>
                )}
                <Button variant="outline" size="sm" onClick={reset}>
                  <RotateCcw className="size-4" />
                  New Document
                </Button>
              </div>
            </div>

            {/* Row 1 — Stat cards */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard
                label="Pages"
                value={uploadedDoc.page_count}
                icon={FileText}
              />
              <StatCard
                label="Entities Found"
                value={entityCount}
                icon={Tags}
              />
              <StatCard
                label="Entity Types"
                value={uniqueLabelCount}
                icon={Layers}
              />
              <StatCard
                label="Avg Confidence"
                value={`${(avgConfidence * 100).toFixed(0)}%`}
                icon={TrendingUp}
              />
            </div>

            {/* Row 2 — Two columns */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Left column */}
              <div className="space-y-4 lg:col-span-2">
                <Card>
                  <CardContent>
                    <SectionLabel>Entity Distribution</SectionLabel>
                    <div className="mt-3 space-y-3">
                      {analyzing ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="size-4 animate-spin" />
                          Analyzing document…
                        </div>
                      ) : groupedEntities.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No entities detected.
                        </p>
                      ) : (
                        groupedEntities.map(([label, list]) => (
                          <div key={label}>
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{label}</span>
                              <span className="font-mono text-xs text-muted-foreground">
                                {list.length}
                              </span>
                            </div>
                            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-elevated">
                              <div
                                className="h-2 rounded-full bg-ai/60"
                                style={{
                                  width: `${
                                    maxLabelCount > 0
                                      ? (list.length / maxLabelCount) * 100
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <SectionLabel>Extracted Text</SectionLabel>
                    <div className="mt-2 max-h-[calc(100vh-20rem)] overflow-auto rounded-md border border-hairline bg-surface p-4">
                      {analyzing ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="size-4 animate-spin" />
                          Analyzing document…
                        </div>
                      ) : (
                        <HighlightedText
                          text={analysisResult?.text ?? uploadedDoc.full_text}
                          entities={analysisResult?.entities ?? []}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <SectionLabel>Talk to Document</SectionLabel>
                    <form
                      className="mt-2 flex items-center gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        void handleAsk();
                      }}
                    >
                      <Input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask a question about this document…"
                        disabled={asking}
                      />
                      <Button
                        type="submit"
                        disabled={asking || question.trim().length === 0}
                      >
                        {asking ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Send className="size-4" />
                        )}
                        Ask
                      </Button>
                    </form>

                    {qaHistory.length === 0 ? (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Ask a question about this document — try "What medications
                        are mentioned?" or "What is the diagnosis?"
                      </p>
                    ) : (
                      <div className="mt-3 space-y-4">
                        {[...qaHistory].reverse().map((entry, i) => (
                          <div key={qaHistory.length - 1 - i} className="space-y-2">
                            <div className="flex justify-end">
                              <div className="max-w-[85%] rounded-lg bg-primary/10 px-3 py-2 text-sm">
                                {entry.question}
                              </div>
                            </div>
                            <div className="flex justify-start">
                              <div className="max-w-[85%]">
                                <AnswerBubble entry={entry} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right column */}
              <div className="space-y-4 lg:col-span-1">
                <Card>
                  <CardContent>
                    <SectionLabel>Document Info</SectionLabel>
                    <div className="mt-2 space-y-1.5 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">File</span>
                        <span className="truncate font-medium">
                          {uploadedDoc.filename}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Pages</span>
                        <span className="font-mono">{uploadedDoc.page_count}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Words</span>
                        <span className="font-mono">
                          {wordCount.toLocaleString()}
                        </span>
                      </div>
                      {analysisResult && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Chunks</span>
                          <span className="font-mono">
                            {analysisResult.chunk_count}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <SectionLabel>All Entities</SectionLabel>
                    <div className="mt-2 max-h-96 space-y-2 overflow-y-auto">
                      {analyzing ? (
                        <p className="text-sm text-muted-foreground">Scanning…</p>
                      ) : groupedEntities.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No entities detected.
                        </p>
                      ) : (
                        groupedEntities.map(([label, list]) => (
                          <EntityGroup
                            key={label}
                            label={label}
                            entities={list}
                          />
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
