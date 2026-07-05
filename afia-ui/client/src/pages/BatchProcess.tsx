import { useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/primitives";
import { cn } from "@/lib/utils";
import { uploadDocument, analyzeDocument } from "@/services/openmed-client";
import { saveDocument } from "@/lib/documents";
import { resolveAnalysisModel } from "@/services/model-preference";
import {
  UPLOAD_ACCEPT,
  isSupportedUploadFile,
  uploadFormatForFile,
} from "@/lib/supported-upload-formats";
import { Upload, Loader2, ExternalLink } from "lucide-react";

type FileStatus = "queued" | "uploading" | "analyzing" | "done" | "error";

interface QueuedFile {
  file: File;
  status: FileStatus;
  error?: string;
  documentId?: string;
}

const STATUS_META: Record<FileStatus, { label: string; className: string }> = {
  queued: { label: "Queued", className: "bg-muted text-muted-foreground" },
  uploading: { label: "Uploading", className: "bg-warning/10 text-warning" },
  analyzing: { label: "Analyzing", className: "bg-warning/10 text-warning" },
  done: { label: "Done", className: "bg-success/10 text-success" },
  error: { label: "Error", className: "bg-destructive/10 text-destructive" },
};

export default function BatchProcess() {
  const [, setLocation] = useLocation();
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const completed = useMemo(
    () => files.filter((f) => f.status === "done" || f.status === "error").length,
    [files],
  );
  const allDone = files.length > 0 && files.every((f) => f.status === "done" || f.status === "error");

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const supported = Array.from(list).filter((f) => isSupportedUploadFile(f));
    if (supported.length === 0) return;
    setFiles((prev) => [
      ...prev,
      ...supported.map((file) => ({ file, status: "queued" as FileStatus })),
    ]);
  };

  const updateFile = (index: number, patch: Partial<QueuedFile>) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    );
  };

  const clearAll = () => setFiles([]);

  const processQueue = async () => {
    setProcessing(true);
    // Snapshot indices of queued files; process sequentially.
    const indices = files
      .map((f, i) => ({ f, i }))
      .filter(({ f }) => f.status === "queued")
      .map(({ i }) => i);

    for (const index of indices) {
      const current = files[index];
      if (!current) continue;
      try {
        updateFile(index, { status: "uploading", error: undefined });
        const doc = await uploadDocument(current.file);
        updateFile(index, { status: "analyzing" });
        const result = await analyzeDocument(
          doc.full_text,
          3000,
          await resolveAnalysisModel(),
        );
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
        updateFile(index, { status: "done", documentId: doc.document_id });
      } catch (e) {
        updateFile(index, {
          status: "error",
          error: e instanceof Error ? e.message : "Processing failed",
        });
      }
    }

    setProcessing(false);
  };

  const onDrop = (ev: React.DragEvent) => {
    ev.preventDefault();
    setDragActive(false);
    addFiles(ev.dataTransfer.files);
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <PageHeader
          title="Batch Processing"
          subtitle="Upload and analyze multiple documents at once"
        />

        {files.length === 0 ? (
          <>
            <input
              ref={inputRef}
              type="file"
              accept={UPLOAD_ACCEPT}
              multiple
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
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
              <Upload className="size-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  Drop documents here or click to browse
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF, Word, PowerPoint, Excel, text, or HTML — multiple files
                </p>
              </div>
            </button>
          </>
        ) : (
          <>
            {/* Summary bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                <span className="font-mono font-medium text-foreground">
                  {completed}
                </span>
                /{files.length} processed
              </span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={processQueue}
                  disabled={processing || allDone}
                >
                  {processing ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Start Processing
                </Button>
                <Button
                  variant="outline"
                  onClick={clearAll}
                  disabled={processing}
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* File list */}
            <div className="rounded-lg border border-hairline">
              {files.map((f, i) => {
                const meta = STATUS_META[f.status];
                const busy = f.status === "uploading" || f.status === "analyzing";
                const FormatIcon = uploadFormatForFile(f.file)?.icon ?? Upload;
                return (
                  <div
                    key={`${f.file.name}-${i}`}
                    className="flex items-center gap-3 border-b border-hairline px-3 py-3 last:border-b-0"
                  >
                    <FormatIcon className="size-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {f.file.name}
                      </div>
                      {f.status === "error" && f.error && (
                        <div className="mt-0.5 text-xs text-destructive">
                          {f.error}
                        </div>
                      )}
                    </div>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                        meta.className,
                      )}
                    >
                      {busy && <Loader2 className="size-3 animate-spin" />}
                      {meta.label}
                    </span>
                    {f.status === "done" && f.documentId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setLocation(`/documents?doc=${f.documentId}`)
                        }
                      >
                        <ExternalLink className="size-4" />
                        View
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
