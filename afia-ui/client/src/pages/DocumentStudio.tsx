import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, SectionLabel } from "@/components/primitives";
import { cn } from "@/lib/utils";
import {
  uploadDocument,
  analyzeDocument,
  askDocument,
  exportFhir,
  BASE_URL,
  type UploadedDocument,
  type DocumentAnalysisResult,
  type DocumentEntity,
  type DocumentSource,
  type FhirExportResult,
} from "@/services/openmed-client";
import { FhirExportModal } from "@/components/FhirExportModal";
import { DocumentInsights } from "@/components/charts/DocumentInsights";
import {
  saveDocument,
  getDocument,
  updateDocument,
  updateDocumentStatus,
  type StoredDocument,
  type DocumentStatus,
  type DocumentLookupOptions,
} from "@/lib/documents";
import { parseDocumentStudioSearch } from "@/lib/document-navigation";
import { useTeamWorkspace } from "@/contexts/TeamWorkspaceContext";
import { MoveToWorkspaceMenu } from "@/components/document-studio/MoveToWorkspaceMenu";
import { logAction } from "@/lib/audit";
import { resolveAnalysisModel } from "@/services/model-preference";
import { ShareMenu } from "@/components/ShareMenu";
import { AnalysisModelPicker } from "@/components/document-studio/AnalysisModelPicker";
import { ExternalSearchMenu } from "@/components/ExternalSearchMenu";
import { APP_PUBLIC_URL } from "@/const";
import { buildDocumentShareText } from "@/lib/social-share";
import {
  UPLOAD_ACCEPT,
  UPLOAD_FORMATS,
  isSupportedUploadFile,
  uploadFormatForFilename,
} from "@/lib/supported-upload-formats";
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
  BookOpen,
  RefreshCw,
  FileJson,
  type LucideIcon,
} from "lucide-react";

function UploadFormatIcons() {
  return (
    <div className="mt-1 flex flex-wrap items-center justify-center gap-4">
      {UPLOAD_FORMATS.map((format) => (
        <div
          key={format.ext}
          className="flex flex-col items-center gap-1 text-muted-foreground"
        >
          <format.icon className="size-5" aria-hidden />
          <span className="text-[10px] font-medium uppercase tracking-wide">
            {format.label}
          </span>
        </div>
      ))}
    </div>
  );
}

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

function cleanModelLabel(modelId: string): string {
  return modelId.replace(/^OpenMed\//i, "").replace(/^.*\//, "");
}

interface QaEntry {
  question: string;
  sources: DocumentSource[];
}

const STATUS_STYLES: Record<
  Exclude<DocumentStatus, "artifact">,
  string
> = {
  new: "border-info/25 bg-info/10 text-info",
  in_progress: "border-warning/25 bg-warning/10 text-warning",
  reviewed: "border-success/25 bg-success/10 text-success",
};

/* Extractive Q&A — passage cards (no generative answer). */
function QaPassageResults({
  entry,
  onPassageClick,
}: {
  entry: QaEntry;
  onPassageClick: (source: DocumentSource) => void;
}) {
  return (
    <div className="space-y-2">
      {entry.sources.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No relevant passages found in this document.
        </p>
      ) : (
        entry.sources.map((s, i) => (
          <button
            key={`${s.start}-${s.end}-${i}`}
            type="button"
            onClick={() => onPassageClick(s)}
            className="flex w-full items-start gap-2 rounded-md border border-hairline bg-surface px-3 py-2 text-left transition-colors hover:border-ai/30 hover:bg-ai/5"
          >
            <span className="flex-1 text-sm leading-relaxed">{s.text}</span>
            <span className="shrink-0 rounded border border-hairline bg-elevated px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
              {(s.score * 100).toFixed(0)}%
            </span>
          </button>
        ))
      )}
      <p className="text-xs text-muted-foreground">
        Showing the most relevant passages from the document
      </p>
    </div>
  );
}

/* Renders document text with entity spans and optional passage highlight. */
function HighlightedText({
  text,
  entities,
  passageHighlight,
  passageHighlightRef,
}: {
  text: string;
  entities: DocumentEntity[];
  passageHighlight?: { start: number; end: number } | null;
  passageHighlightRef?: React.RefObject<HTMLSpanElement | null>;
}) {
  type SegmentKind = "plain" | "entity" | "passage";

  const boundaries = new Set<number>([0, text.length]);
  for (const e of entities) {
    if (e.start >= 0 && e.end <= text.length && e.start < e.end) {
      boundaries.add(e.start);
      boundaries.add(e.end);
    }
  }
  if (passageHighlight) {
    const { start, end } = passageHighlight;
    if (start >= 0 && end <= text.length && start < end) {
      boundaries.add(start);
      boundaries.add(end);
    }
  }

  const points = [...boundaries].sort((a, b) => a - b);
  const nodes: ReactNode[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const segStart = points[i];
    const segEnd = points[i + 1];
    if (segStart >= segEnd) continue;

    const inPassage =
      passageHighlight &&
      segStart >= passageHighlight.start &&
      segEnd <= passageHighlight.end;
    const entity = entities.find(
      (e) => segStart >= e.start && segEnd <= e.end,
    );

    let kind: SegmentKind = "plain";
    if (inPassage) kind = "passage";
    else if (entity) kind = "entity";

    const slice = text.slice(segStart, segEnd);
    if (!slice) continue;

    if (kind === "passage") {
      const isFirstPassageSegment = segStart === passageHighlight!.start;
      nodes.push(
        <span
          key={`p-${segStart}`}
          ref={isFirstPassageSegment ? passageHighlightRef : undefined}
          className="rounded bg-warning/20 px-0.5 ring-1 ring-warning/30"
        >
          {slice}
        </span>,
      );
    } else if (kind === "entity" && entity) {
      nodes.push(
        <span
          key={`e-${segStart}`}
          title={`${entity.label} · ${(entity.confidence * 100).toFixed(1)}%`}
          className="rounded bg-ai/15 px-0.5 text-ai"
        >
          {slice}
        </span>,
      );
    } else {
      nodes.push(<span key={`t-${segStart}`}>{slice}</span>);
    }
  }

  return (
    <p className="font-mono text-xs leading-relaxed whitespace-pre-wrap">
      {nodes}
    </p>
  );
}

function ExtractedTextPanel({
  text,
  entities,
  analyzing,
  passageHighlight,
}: {
  text: string;
  entities: DocumentEntity[];
  analyzing: boolean;
  passageHighlight?: { start: number; end: number } | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const passageHighlightRef = useRef<HTMLSpanElement>(null);
  const [selectionAnchor, setSelectionAnchor] = useState<{
    text: string;
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    if (!passageHighlight) return;
    passageHighlightRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [passageHighlight]);

  const updateSelectionAnchor = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !containerRef.current) {
      setSelectionAnchor(null);
      return;
    }

    const selectedText = sel.toString().trim();
    const anchorNode = sel.anchorNode;
    if (
      !selectedText ||
      !anchorNode ||
      !containerRef.current.contains(anchorNode)
    ) {
      setSelectionAnchor(null);
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    setSelectionAnchor({
      text: selectedText,
      top:
        rect.top - containerRect.top + containerRef.current.scrollTop - 32,
      left: Math.max(
        0,
        rect.left - containerRect.left + containerRef.current.scrollLeft,
      ),
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative mt-2 max-h-[calc(100vh-20rem)] overflow-auto rounded-md border border-hairline bg-surface p-4"
      onMouseUp={updateSelectionAnchor}
      onKeyUp={updateSelectionAnchor}
    >
      {selectionAnchor && (
        <div
          className="absolute z-10"
          style={{
            top: selectionAnchor.top,
            left: selectionAnchor.left,
          }}
        >
          <ExternalSearchMenu
            query={selectionAnchor.text}
            align="start"
            trigger={
              <Button
                variant="secondary"
                size="sm"
                className="h-7 text-xs shadow-md"
              >
                <BookOpen className="size-3.5" />
                Search literature
              </Button>
            }
          />
        </div>
      )}
      {analyzing ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Analyzing document…
        </div>
      ) : (
        <HighlightedText
          text={text}
          entities={entities}
          passageHighlight={passageHighlight}
          passageHighlightRef={passageHighlightRef}
        />
      )}
    </div>
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
  const [passageHighlight, setPassageHighlight] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [status, setStatus] = useState<DocumentStatus>("new");
  const [fhirModalOpen, setFhirModalOpen] = useState(false);
  const [fhirExporting, setFhirExporting] = useState(false);
  const [fhirError, setFhirError] = useState<string | null>(null);
  const [fhirResult, setFhirResult] = useState<FhirExportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const search = useSearch();
  const { activeWorkspaceId, canEditInActiveWorkspace } = useTeamWorkspace();
  const [storedRowId, setStoredRowId] = useState<string | null>(null);
  const [storedWorkspaceId, setStoredWorkspaceId] = useState<string | null>(
    null,
  );

  const documentLookup = useMemo((): DocumentLookupOptions => {
    const { workspaceHint } = parseDocumentStudioSearch(search);
    return {
      documentId: storedRowId ?? undefined,
      workspaceId:
        workspaceHint !== undefined
          ? workspaceHint
          : storedWorkspaceId ?? activeWorkspaceId,
    };
  }, [search, storedRowId, storedWorkspaceId, activeWorkspaceId]);

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
    const { docId, rowId, workspaceHint } = parseDocumentStudioSearch(search);
    if (!docId) return;
    let active = true;
    getDocument(docId, {
      documentId: rowId ?? undefined,
      workspaceId:
        workspaceHint !== undefined ? workspaceHint : activeWorkspaceId,
    })
      .then((stored: StoredDocument | null) => {
        if (!active || !stored) return;
        setStoredRowId(stored.rowId);
        setStoredWorkspaceId(stored.workspaceId);
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
          model_used: stored.modelUsed ?? null,
        });
        setQaHistory(
          stored.qaHistory.map((entry) => ({
            question: entry.question,
            sources: entry.sources ?? [],
          })),
        );
        setStatus(stored.status ?? "new");
      })
      .catch(() => {
        /* ignore restore failures — fall back to the upload dropzone */
      });
    return () => {
      active = false;
    };
  }, [search, activeWorkspaceId]);

  const reset = () => {
    setStoredRowId(null);
    setStoredWorkspaceId(null);
    setUploadedDoc(null);
    setUploading(false);
    setAnalyzing(false);
    setAnalysisResult(null);
    setError(null);
    setDragActive(false);
    setQuestion("");
    setAsking(false);
    setQaHistory([]);
    setPassageHighlight(null);
    setFhirModalOpen(false);
    setFhirResult(null);
    setFhirError(null);
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
      const result = await askDocument(
        uploadedDoc.full_text,
        q,
        3,
        uploadedDoc.document_id,
      );
      const newEntry: QaEntry = {
        question: q,
        sources: result.sources,
      };
      const nextHistory = [...qaHistory, newEntry];
      setQaHistory(nextHistory);
      setQuestion("");
      const nextStatus: DocumentStatus =
        status === "reviewed" ? "reviewed" : "in_progress";
      setStatus(nextStatus);
      await updateDocument(
        uploadedDoc.document_id,
        {
          status: nextStatus,
          metadata: {
            page_count: uploadedDoc.page_count,
            entities: analysisResult?.entities || [],
            model_used: analysisResult?.model_used ?? undefined,
            qa_history: nextHistory,
            last_accessed_at: Date.now(),
          },
        },
        documentLookup,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Question failed");
    } finally {
      setAsking(false);
    }
  };

  const handlePassageClick = (source: DocumentSource) => {
    setPassageHighlight({ start: source.start, end: source.end });
  };

  const handleFile = async (file: File) => {
    console.log("[DocumentStudio] handleFile called:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });
    if (!isSupportedUploadFile(file)) {
      setError("Unsupported file type. Use PDF, Word, PowerPoint, Excel, text, or HTML.");
      return;
    }
    setError(null);
    setAnalysisResult(null);
    setUploading(true);
    try {
      console.log("[DocumentStudio] uploading to:", `${BASE_URL}/upload`);
      let doc: UploadedDocument;
      try {
        doc = await uploadDocument(file);
      } catch (uploadErr) {
        console.error("[DocumentStudio] uploadDocument failed:", uploadErr);
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
        const saved = await saveDocument(
          {
            id: doc.document_id,
            filename: doc.filename,
            full_text: doc.full_text,
            page_count: doc.page_count,
            status: "new",
            entities: result.entities,
            modelUsed: result.model_used ?? undefined,
            qaHistory: [],
            uploadedAt: Date.now(),
            lastAccessedAt: Date.now(),
          },
          activeWorkspaceId,
        );
        setStoredRowId(saved.rowId);
        setStoredWorkspaceId(saved.workspaceId);
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

  const handleReanalyze = async () => {
    if (!uploadedDoc || analyzing) return;
    setError(null);
    setAnalyzing(true);
    try {
      const result = await analyzeDocument(
        uploadedDoc.full_text,
        3000,
        await resolveAnalysisModel(),
      );
      setAnalysisResult(result);
      await updateDocument(
        uploadedDoc.document_id,
        {
          metadata: {
            page_count: uploadedDoc.page_count,
            entities: result.entities,
            model_used: result.model_used ?? undefined,
            qa_history: qaHistory,
            last_accessed_at: Date.now(),
          },
        },
        documentLookup,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Re-analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExportFhir = async () => {
    if (!uploadedDoc || !analysisResult || analysisResult.entities.length === 0)
      return;
    setFhirModalOpen(true);
    setFhirExporting(true);
    setFhirError(null);
    setFhirResult(null);
    try {
      const result = await exportFhir(analysisResult.entities, {
        title: uploadedDoc.filename,
        page_count: uploadedDoc.page_count,
        analyzed_with: analysisResult.model_used ?? undefined,
      });
      setFhirResult(result);
    } catch (e) {
      setFhirError(e instanceof Error ? e.message : "FHIR export failed");
    } finally {
      setFhirExporting(false);
    }
  };

  const handleDownloadFhir = () => {
    if (!fhirResult || !uploadedDoc) return;
    const json = JSON.stringify(fhirResult.bundle, null, 2);
    downloadFile(
      json,
      `afia-fhir-${uploadedDoc.document_id}.json`,
      "application/json",
    );
    logAction("export", "document", uploadedDoc.document_id);
  };

  const entities = analysisResult?.entities ?? [];
  const entityCount = entities.length;
  const uniqueLabelCount = groupedEntities.length;
  const avgConfidence =
    entities.length > 0
      ? entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length
      : 0;
  const maxLabelCount = groupedEntities.length > 0 ? groupedEntities[0][1].length : 0;
  const openFormat = uploadedDoc
    ? uploadFormatForFilename(uploadedDoc.filename)
    : null;
  const OpenFormatIcon = openFormat?.icon ?? FileText;

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-start justify-between gap-4 border-b border-hairline px-6 py-4">
        <PageHeader
          title="Document Studio"
          subtitle="Upload clinical documents and detect entities across the full text"
        />
        {!uploadedDoc && <AnalysisModelPicker className="shrink-0" />}
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
              accept={UPLOAD_ACCEPT}
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
                  {uploading
                    ? "Uploading…"
                    : "Drop a document here or click to browse"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF, Word, PowerPoint, Excel, text, or HTML
                </p>
              </div>
              {!uploading && <UploadFormatIcons />}
            </button>
          </>
        ) : (
          <div className="space-y-4">
            {/* Document header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <OpenFormatIcon className="size-5 shrink-0 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{uploadedDoc.filename}</p>
                    <select
                      value={status}
                      disabled={!canEditInActiveWorkspace}
                      onChange={(e) => {
                        const next = e.target.value as DocumentStatus;
                        setStatus(next);
                        void updateDocumentStatus(
                          uploadedDoc.document_id,
                          next,
                          documentLookup,
                        );
                      }}
                      aria-label="Review status"
                      className={cn(
                        "rounded-md border px-1.5 py-0.5 text-xs font-medium",
                        STATUS_STYLES[status as Exclude<DocumentStatus, "artifact">],
                      )}
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="reviewed">Reviewed</option>
                    </select>
                    <AnalysisModelPicker />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {uploadedDoc.page_count} pages ·{" "}
                    {uploadedDoc.full_text.length.toLocaleString()} chars
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {analysisResult && entityCount > 0 && (
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void handleExportFhir()}
                    >
                      <FileJson className="size-4" />
                      Export FHIR
                    </Button>
                    <ShareMenu
                      text={buildDocumentShareText(
                        entityCount,
                        uploadedDoc.page_count,
                      )}
                      url={APP_PUBLIC_URL}
                    />
                    {storedRowId && (
                      <MoveToWorkspaceMenu
                        bridgeDocumentId={uploadedDoc.document_id}
                        currentWorkspaceId={storedWorkspaceId}
                        lookup={documentLookup}
                        onMoved={(workspaceId) =>
                          setStoredWorkspaceId(workspaceId)
                        }
                      />
                    )}
                  </>
                )}
                <Button variant="outline" size="sm" onClick={reset}>
                  <RotateCcw className="size-4" />
                  New Document
                </Button>
              </div>
            </div>

            {/* Row 1 — Stat cards */}
            <div className="space-y-2">
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
              {analysisResult?.model_used && !analyzing && (
                <p className="text-xs text-muted-foreground">
                  Analyzed with:{" "}
                  <span className="font-mono text-foreground/80">
                    {cleanModelLabel(analysisResult.model_used)}
                  </span>
                </p>
              )}
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
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            No entities detected.
                          </p>
                          {analysisResult && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto px-0 py-0 text-xs text-muted-foreground hover:text-foreground"
                              disabled={analyzing}
                              onClick={() => void handleReanalyze()}
                            >
                              {analyzing ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <RefreshCw className="size-3.5" />
                              )}
                              Re-analyze with current model
                            </Button>
                          )}
                        </div>
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
                    {!analyzing && analysisResult && entityCount > 0 && (
                      <DocumentInsights
                        entities={entities}
                        groupedEntities={groupedEntities}
                        entityCount={entityCount}
                        pageCount={uploadedDoc.page_count}
                        documentLength={
                          analysisResult.text.length ||
                          uploadedDoc.full_text.length
                        }
                      />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <SectionLabel>Extracted Text</SectionLabel>
                    <ExtractedTextPanel
                      text={analysisResult?.text ?? uploadedDoc.full_text}
                      entities={analysisResult?.entities ?? []}
                      analyzing={analyzing}
                      passageHighlight={passageHighlight}
                    />
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
                        Ask a question to find relevant passages in this
                        document — answers are not generated yet.
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
                              <div className="max-w-[85%] w-full">
                                <QaPassageResults
                                  entry={entry}
                                  onPassageClick={handlePassageClick}
                                />
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

      <FhirExportModal
        open={fhirModalOpen}
        onOpenChange={setFhirModalOpen}
        result={fhirResult}
        loading={fhirExporting}
        error={fhirError}
        onDownload={handleDownloadFhir}
      />
    </div>
  );
}
