import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useTeamWorkspace } from "@/contexts/TeamWorkspaceContext";
import { documentStudioHref } from "@/lib/document-navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { SectionLabel } from "@/components/primitives";
import { buildEntityLabelColorMap } from "@/components/charts/entity-chart-colors";
import {
  EntityGraphCanvas,
  downloadGraphJson,
  exportGraphPng,
} from "@/components/analytics/EntityGraphCanvas";
import {
  computeLibraryOverview,
  type AnalyzedDocSummary,
} from "@/lib/analytics-library";
import { ShareMenu } from "@/components/ShareMenu";
import { getAppPublicUrl } from "@/lib/app-url";
import { buildAnalyticsShareText } from "@/lib/social-share";
import {
  buildEntityNodeMeta,
  buildGraphFromLibrary,
  countVisibleNodes,
  hideElementInSpec,
  mergeGraphWithSavedLayout,
  parseGraphSpecJson,
  serializeGraphSpec,
  specsEqual,
} from "@/lib/entity-graph-builder";
import {
  loadLibraryGraphArtifact,
  saveLibraryGraphArtifact,
} from "@/lib/graph-artifact";
import type { LibraryGraphSpec } from "@/lib/documents";
import {
  ChevronDown,
  Code2,
  Download,
  EyeOff,
  Image,
  Loader2,
  Network,
  Save,
} from "lucide-react";

interface EntityGraphPanelProps {
  analyzedDocs: AnalyzedDocSummary[];
}

export function EntityGraphPanel({ analyzedDocs }: EntityGraphPanelProps) {
  const [, setLocation] = useLocation();
  const { activeWorkspaceId } = useTeamWorkspace();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const editorFocusedRef = useRef(false);
  const baselineRef = useRef<LibraryGraphSpec | null>(null);

  const [graphSpec, setGraphSpec] = useState<LibraryGraphSpec | null>(null);
  const [savedSpec, setSavedSpec] = useState<LibraryGraphSpec | null>(null);
  const [artifactLoading, setArtifactLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [minCooccurrence, setMinCooccurrence] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorText, setEditorText] = useState("");
  const [editorError, setEditorError] = useState<string | null>(null);

  const nodeMeta = useMemo(
    () => buildEntityNodeMeta(analyzedDocs),
    [analyzedDocs],
  );

  const shareText = useMemo(() => {
    const overview = computeLibraryOverview(analyzedDocs);
    return buildAnalyticsShareText(
      overview.documentCount,
      overview.totalEntities,
    );
  }, [analyzedDocs]);

  const labelTypes = useMemo(() => {
    const types = new Set<string>();
    graphSpec?.elements.forEach((el) => types.add(el.type));
    return [...types];
  }, [graphSpec]);

  const colorMap = useMemo(
    () => buildEntityLabelColorMap(labelTypes),
    [labelTypes],
  );

  const unsaved = useMemo(() => {
    if (!graphSpec) return false;
    const baseline = savedSpec ?? baselineRef.current;
    if (!baseline) return false;
    return !specsEqual(graphSpec, baseline);
  }, [graphSpec, savedSpec]);

  const syncEditorFromSpec = useCallback((spec: LibraryGraphSpec) => {
    if (!editorFocusedRef.current) {
      setEditorText(serializeGraphSpec(spec));
      setEditorError(null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    setArtifactLoading(true);
    void loadLibraryGraphArtifact()
      .then((saved) => {
        if (!active) return;
        setSavedSpec(saved);
      })
      .catch(() => {
        if (active) setSavedSpec(null);
      })
      .finally(() => {
        if (active) setArtifactLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (analyzedDocs.length < 2) {
      setGraphSpec(null);
      return;
    }
    const built = buildGraphFromLibrary(analyzedDocs);
    setGraphSpec((prev) => {
      const overlay = prev ?? savedSpec;
      const merged = mergeGraphWithSavedLayout(built, overlay);
      if (!baselineRef.current) {
        baselineRef.current = merged;
      }
      syncEditorFromSpec(merged);
      return merged;
    });
  }, [analyzedDocs, savedSpec, syncEditorFromSpec]);

  const visibleNodeCount = useMemo(() => {
    if (!graphSpec) return 0;
    return countVisibleNodes(graphSpec);
  }, [graphSpec]);

  const selectedMeta = selectedNodeId ? nodeMeta.get(selectedNodeId) : null;
  const selectedElement = graphSpec?.elements.find(
    (el) => el.id === selectedNodeId,
  );

  const selectedDocs = useMemo(() => {
    if (!selectedNodeId) return [];
    return analyzedDocs.filter((doc) =>
      doc.entities.some(
        (e) => e.text.trim().toLowerCase() === selectedNodeId,
      ),
    );
  }, [analyzedDocs, selectedNodeId]);

  const handleSpecChange = useCallback(
    (next: LibraryGraphSpec) => {
      setGraphSpec(next);
      syncEditorFromSpec(next);
    },
    [syncEditorFromSpec],
  );

  const handleApplyEditor = () => {
    try {
      const parsed = parseGraphSpecJson(editorText);
      setGraphSpec(parsed);
      setEditorError(null);
      toast.success("Graph spec applied");
    } catch (e) {
      setEditorError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const handleSave = async () => {
    if (!graphSpec) return;
    setSaving(true);
    try {
      await saveLibraryGraphArtifact(graphSpec);
      setSavedSpec(graphSpec);
      baselineRef.current = graphSpec;
      toast.success("Graph layout saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save graph");
    } finally {
      setSaving(false);
    }
  };

  const handleHideSelected = () => {
    if (!graphSpec || !selectedNodeId) return;
    handleSpecChange(hideElementInSpec(graphSpec, selectedNodeId));
    setSelectedNodeId(null);
  };

  if (artifactLoading && !graphSpec) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading saved graph layout…
      </div>
    );
  }

  if (!graphSpec || graphSpec.elements.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Network className="mx-auto size-10 text-muted-foreground/60" />
          <p className="mt-4 text-sm font-medium">No entities to graph yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Analyze documents with detected entities to build the entity graph.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (visibleNodeCount < 2) {
    return (
      <Card>
        <CardContent className="space-y-4 py-8">
          <div className="text-center">
            <Network className="mx-auto size-10 text-muted-foreground/60" />
            <p className="mt-4 text-sm font-medium">
              Not enough visible connections at this threshold
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Lower the minimum co-occurrence filter or analyze more documents.
            </p>
          </div>
          <div className="mx-auto max-w-md space-y-2">
            <Label htmlFor="min-cooc-empty">
              Min co-occurrence: {minCooccurrence}
            </Label>
            <Slider
              id="min-cooc-empty"
              min={1}
              max={10}
              step={1}
              value={[minCooccurrence]}
              onValueChange={([value]) => setMinCooccurrence(value ?? 1)}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-[200px] flex-1 items-center gap-3">
          <Label htmlFor="min-cooc" className="shrink-0 text-xs">
            Min co-occurrence
          </Label>
          <Slider
            id="min-cooc"
            className="max-w-xs flex-1"
            min={1}
            max={10}
            step={1}
            value={[minCooccurrence]}
            onValueChange={([value]) => setMinCooccurrence(value ?? 1)}
          />
          <span className="w-6 text-sm tabular-nums text-muted-foreground">
            {minCooccurrence}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="graph-labels"
            checked={showLabels}
            onCheckedChange={setShowLabels}
          />
          <Label htmlFor="graph-labels" className="text-xs">
            Labels
          </Label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => void handleSave()}
            disabled={saving || !unsaved}
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save
            {unsaved && (
              <span
                className="size-2 rounded-full bg-primary"
                title="Unsaved changes"
                aria-label="Unsaved changes"
              />
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadGraphJson(graphSpec)}
          >
            <Download className="size-4" />
            JSON
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (!svgRef.current) {
                toast.error("Graph canvas not ready");
                return;
              }
              void exportGraphPng(svgRef.current).catch((e) =>
                toast.error(
                  e instanceof Error ? e.message : "PNG export failed",
                ),
              );
            }}
          >
            <Image className="size-4" />
            PNG
          </Button>
          <ShareMenu
            text={shareText}
            url={getAppPublicUrl()}
            emailSubject="AFIA Entity Graph summary"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="relative min-h-[520px] flex-1 overflow-hidden rounded-lg border border-hairline">
          <EntityGraphCanvas
            spec={graphSpec}
            minCooccurrence={minCooccurrence}
            showLabels={showLabels}
            nodeMeta={nodeMeta}
            colorMap={colorMap}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onSpecChange={handleSpecChange}
            onSvgReady={(svg) => {
              svgRef.current = svg;
            }}
          />
        </div>

        {selectedElement && selectedMeta && (
          <Card className="w-full shrink-0 lg:w-72">
            <CardContent className="space-y-3">
              <SectionLabel>Selected entity</SectionLabel>
              <div>
                <div className="font-medium">{selectedElement.label}</div>
                <div className="mt-1 inline-flex rounded border border-ai/25 bg-ai/10 px-1.5 py-0.5 font-mono text-[11px] text-ai">
                  {selectedElement.type}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                In {selectedMeta.docFrequency} document
                {selectedMeta.docFrequency === 1 ? "" : "s"}
              </p>
              <div className="space-y-1">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Documents
                </div>
                <ul className="max-h-40 space-y-1 overflow-auto text-sm">
                  {selectedDocs.map((doc) => (
                    <li key={doc.rowId}>
                      <button
                        type="button"
                        className="text-left text-primary hover:underline"
                        onClick={() =>
                          setLocation(
                            documentStudioHref(
                              { id: doc.id, rowId: doc.rowId },
                              doc.workspaceId ?? activeWorkspaceId,
                            ),
                          )
                        }
                      >
                        {doc.filename}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleHideSelected}
                >
                  <EyeOff className="size-4" />
                  Hide node
                </Button>
                {selectedElement.pinned && (
                  <p className="w-full text-xs text-muted-foreground">
                    Double-click the node on the canvas to unpin.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Collapsible open={editorOpen} onOpenChange={setEditorOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Code2 className="size-4" />
              Graph spec editor
            </span>
            <ChevronDown
              className={`size-4 transition-transform ${editorOpen ? "rotate-180" : ""}`}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-2">
          <Textarea
            value={editorText}
            onChange={(e) => setEditorText(e.target.value)}
            onFocus={() => {
              editorFocusedRef.current = true;
            }}
            onBlur={() => {
              editorFocusedRef.current = false;
            }}
            className="min-h-[240px] font-mono text-xs"
            spellCheck={false}
          />
          {editorError && (
            <p className="text-sm text-destructive">{editorError}</p>
          )}
          <div className="flex justify-end">
            <Button size="sm" onClick={handleApplyEditor}>
              Apply
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
