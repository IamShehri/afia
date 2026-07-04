import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, SectionLabel } from "@/components/primitives";
import { cn } from "@/lib/utils";
import {
  checkHealth,
  analyzeText,
  extractPII,
  deidentifyText,
  type AnalyzeResult,
  type DeidentifyResult,
  type OpenMedEntity,
} from "@/services/openmed-client";
import { resolveAnalysisModel } from "@/services/model-preference";
import { ScanText, Shield, EyeOff, Loader2, AlertCircle } from "lucide-react";

type Result =
  | { kind: "entities" | "pii"; data: AnalyzeResult }
  | { kind: "deidentify"; data: DeidentifyResult };

const SAMPLE =
  "John Smith, a 62-year-old male, presented with chest pain and was started on aspirin 81mg daily.";

/* Renders source text with detected entity spans highlighted inline. */
function HighlightedText({
  text,
  entities,
}: {
  text: string;
  entities: OpenMedEntity[];
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
    <p className="text-sm leading-relaxed whitespace-pre-wrap">{nodes}</p>
  );
}

function EntityList({ entities }: { entities: OpenMedEntity[] }) {
  if (entities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No entities detected.</p>
    );
  }
  return (
    <div className="space-y-1.5">
      {entities.map((e, i) => (
        <div
          key={`${e.start}-${e.end}-${i}`}
          className="flex items-center gap-2 rounded-md border border-hairline bg-surface px-2.5 py-1.5"
        >
          <span className="rounded border border-ai/25 bg-ai/10 px-1.5 py-0.5 text-[11px] font-medium text-ai">
            {e.label}
          </span>
          <span className="flex-1 truncate text-sm">{e.text}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {(e.confidence * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Assistant() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [text, setText] = useState(SAMPLE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    let active = true;
    checkHealth().then((ok) => {
      if (active) setConnected(ok);
    });
    return () => {
      active = false;
    };
  }, []);

  const canRun = text.trim().length > 0 && !loading;

  const run = async (kind: "entities" | "pii" | "deidentify") => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      if (kind === "deidentify") {
        const data = await deidentifyText(text);
        setResult({ kind, data });
      } else {
        const data =
          kind === "pii"
            ? await extractPII(text)
            : await analyzeText(text, await resolveAnalysisModel());
        setResult({ kind, data });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-hairline px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <PageHeader
            title="OpenMed Workbench"
            subtitle="Analyze clinical text with OpenMed models"
          />
          <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className={cn(
                "size-1.5 rounded-full",
                connected === null
                  ? "bg-muted-foreground animate-pulse"
                  : connected
                    ? "bg-success"
                    : "bg-destructive",
              )}
            />
            {connected === null
              ? "Checking bridge…"
              : connected
                ? "Bridge connected"
                : "Bridge offline"}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl space-y-4">
          <div>
            <SectionLabel>Clinical text</SectionLabel>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste clinical text to analyze…"
              className="mt-2 min-h-32 font-mono text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => run("entities")} disabled={!canRun}>
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ScanText className="size-4" />
              )}
              Detect Entities
            </Button>
            <Button variant="outline" onClick={() => run("pii")} disabled={!canRun}>
              <Shield className="size-4" />
              Extract PII
            </Button>
            <Button
              variant="outline"
              onClick={() => run("deidentify")}
              disabled={!canRun}
            >
              <EyeOff className="size-4" />
              De-identify
            </Button>
          </div>

          {connected === false && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>
                OpenMed bridge is unreachable at{" "}
                <span className="font-mono">127.0.0.1:8765</span>. Start the
                bridge service and reload.
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Analyzing…
            </div>
          )}

          {!loading && result && (
            <Card>
              <CardContent className="space-y-4">
                {result.kind === "deidentify" ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <SectionLabel>Original</SectionLabel>
                      <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                        {result.data.original}
                      </p>
                    </div>
                    <div>
                      <SectionLabel>De-identified</SectionLabel>
                      <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                        {result.data.deidentified}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="font-mono truncate">{result.data.model}</span>
                      <span className="font-mono shrink-0">
                        {result.data.processing_time.toFixed(2)}s
                      </span>
                    </div>
                    <div>
                      <SectionLabel>Highlighted text</SectionLabel>
                      <div className="mt-2">
                        <HighlightedText
                          text={result.data.text}
                          entities={result.data.entities}
                        />
                      </div>
                    </div>
                    <div>
                      <SectionLabel>
                        {result.kind === "pii" ? "PII" : "Entities"} (
                        {result.data.entities.length})
                      </SectionLabel>
                      <div className="mt-2">
                        <EntityList entities={result.data.entities} />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {!loading && !result && !error && (
            <p className="text-sm text-muted-foreground">
              Paste clinical text above and choose an action to see results.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
