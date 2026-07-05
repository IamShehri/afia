import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, SectionLabel } from "@/components/primitives";
import { TopEntitiesBar } from "@/components/charts/TopEntitiesBar";
import { LibraryConfidenceChart } from "@/components/charts/LibraryConfidenceChart";
import { DocumentComparisonPanel } from "@/components/analytics/DocumentComparison";
import { EntityGraphPanel } from "@/components/analytics/EntityGraphPanel";
import { CooccurrenceMatrixPanel } from "@/components/analytics/CooccurrenceMatrix";
import { EntityStatisticsTable } from "@/components/analytics/EntityStatisticsTable";
import { ResearchDataExportButton } from "@/components/analytics/ResearchDataExportButton";
import { ResearchReportButton } from "@/components/analytics/ResearchReportButton";
import { logAction } from "@/lib/audit";
import { loadLibrarySummaries } from "@/lib/analytics-loader";
import { useTeamWorkspace } from "@/contexts/TeamWorkspaceContext";
import { ShareMenu } from "@/components/ShareMenu";
import { APP_PUBLIC_URL } from "@/const";
import { buildAnalyticsShareText } from "@/lib/social-share";
import {
  computeConfidenceByDocument,
  computeLibraryOverview,
  computeTopEntities,
  LIBRARY_ANALYTICS_CAP,
  type AnalyzedDocSummary,
} from "@/lib/analytics-library";
import {
  parseAnalyticsTab,
  type AnalyticsTab,
  analyticsHref,
} from "@/data/nav";
import {
  BarChart3,
  FileText,
  Layers,
  Loader2,
  Network,
  RefreshCw,
  Table2,
  Tags,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

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

export default function Analytics() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { activeWorkspaceId, activeWorkspace } = useTeamWorkspace();
  const auditedRef = useRef(false);
  const activeTab = parseAnalyticsTab(search);

  const setActiveTab = useCallback(
    (tab: AnalyticsTab) => {
      setLocation(analyticsHref(tab));
    },
    [setLocation],
  );

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });
  const [analyzedDocs, setAnalyzedDocs] = useState<AnalyzedDocSummary[]>([]);
  const [skippedUnanalyzed, setSkippedUnanalyzed] = useState(0);
  const [truncated, setTruncated] = useState(false);
  const [totalInLibrary, setTotalInLibrary] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [docAId, setDocAId] = useState("");
  const [docBId, setDocBId] = useState("");

  const runLoad = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setProgress({ loaded: 0, total: 0 });
    setAnalyzedDocs([]);
    setSkippedUnanalyzed(0);
    setDocAId("");
    setDocBId("");
    try {
      const result = await loadLibrarySummaries(
        {
          onProgress: (loaded, total) => {
            setProgress({ loaded, total });
          },
          onPartial: ({ analyzed, skippedUnanalyzed: skipped }) => {
            setAnalyzedDocs(analyzed);
            setSkippedUnanalyzed(skipped);
          },
        },
        { workspaceId: activeWorkspaceId },
      );
      setAnalyzedDocs(result.analyzed);
      setSkippedUnanalyzed(result.skippedUnanalyzed);
      setTruncated(result.truncated);
      setTotalInLibrary(result.totalInLibrary);
      if (result.analyzed.length >= 2) {
        setDocAId(result.analyzed[0].id);
        setDocBId(result.analyzed[1].id);
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load library");
      setAnalyzedDocs([]);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (!auditedRef.current) {
      auditedRef.current = true;
      logAction("view", "analysis");
    }
    void runLoad();
  }, [runLoad]);

  const overview = useMemo(
    () => computeLibraryOverview(analyzedDocs),
    [analyzedDocs],
  );
  const topEntities = useMemo(
    () => computeTopEntities(analyzedDocs, 15),
    [analyzedDocs],
  );
  const confidenceByDoc = useMemo(
    () => computeConfidenceByDocument(analyzedDocs),
    [analyzedDocs],
  );

  const showEmpty = !loading && analyzedDocs.length < 2;

  const analyticsShareText = useMemo(
    () =>
      buildAnalyticsShareText(
        overview.documentCount,
        overview.totalEntities,
      ),
    [overview.documentCount, overview.totalEntities],
  );

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b border-hairline px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <PageHeader
            title="Analytics Lab"
            subtitle={
              activeWorkspace
                ? `Cross-document intelligence in ${activeWorkspace.name}`
                : "Cross-document intelligence and research workbench"
            }
          />
          <div className="flex shrink-0 items-center gap-2">
            {!showEmpty && analyzedDocs.length >= 2 && (
              <ShareMenu
                text={analyticsShareText}
                url={APP_PUBLIC_URL}
                emailSubject="AFIA Analytics summary"
              />
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => void runLoad()}
            >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Refresh
          </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Analyzing library… {progress.loaded}/{progress.total || "…"}{" "}
              documents
            </div>
          )}

          {loadError && (
            <p className="text-sm text-destructive">{loadError}</p>
          )}

          {!loading && truncated && (
            <p className="rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-muted-foreground">
              Showing analytics for the {LIBRARY_ANALYTICS_CAP} most recent
              documents
              {totalInLibrary > LIBRARY_ANALYTICS_CAP
                ? ` (${totalInLibrary} in your library).`
                : "."}
            </p>
          )}

          {skippedUnanalyzed > 0 && (
            <p className="text-sm text-muted-foreground">
              {skippedUnanalyzed} document
              {skippedUnanalyzed === 1 ? "" : "s"} not yet analyzed —{" "}
              <button
                type="button"
                onClick={() => setLocation("/research")}
                className="font-medium text-primary hover:underline"
              >
                analyze them
              </button>{" "}
              to include.
            </p>
          )}

          {showEmpty ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="mx-auto size-10 text-muted-foreground/60" />
                <p className="mt-4 text-sm font-medium">
                  Analytics needs at least 2 analyzed documents
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload and analyze PDFs in Document Studio to unlock
                  cross-document insights.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setLocation("/documents")}
                >
                  <FileText className="size-4" />
                  Open Document Studio
                </Button>
              </CardContent>
            </Card>
          ) : analyzedDocs.length >= 2 ? (
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as AnalyticsTab)}
              className="space-y-6"
            >
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="graph">
                  <Network className="size-4" />
                  Entity Graph
                </TabsTrigger>
                <TabsTrigger value="workbench">
                  <Table2 className="size-4" />
                  Workbench
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatCard
                  label="Analyzed docs"
                  value={overview.documentCount}
                  icon={FileText}
                />
                <StatCard
                  label="Total entities"
                  value={overview.totalEntities.toLocaleString()}
                  icon={Tags}
                />
                <StatCard
                  label="Avg confidence"
                  value={`${(overview.avgConfidence * 100).toFixed(0)}%`}
                  icon={TrendingUp}
                />
                <StatCard
                  label="Top label"
                  value={overview.topLabel ?? "—"}
                  icon={Layers}
                />
              </div>

              <Card>
                <CardContent>
                  <SectionLabel>Top entities across your library</SectionLabel>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Most frequent entity texts (case-insensitive), colored by
                    label
                  </p>
                  <div className="mt-4">
                    <TopEntitiesBar rows={topEntities} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <DocumentComparisonPanel
                    docs={analyzedDocs}
                    docAId={docAId}
                    docBId={docBId}
                    onDocAChange={setDocAId}
                    onDocBChange={setDocBId}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <SectionLabel>Confidence by document</SectionLabel>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Average entity confidence per document — weakest analyses
                    first
                  </p>
                  <div className="mt-4">
                    <LibraryConfidenceChart rows={confidenceByDoc} />
                  </div>
                </CardContent>
              </Card>
              </TabsContent>

              <TabsContent value="graph">
                <Card>
                  <CardContent>
                    <SectionLabel>Entity graph</SectionLabel>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Co-occurrence network across your analyzed library — drag
                      to pin, double-click to unpin, right-click to hide
                    </p>
                    <div className="mt-4">
                      <EntityGraphPanel analyzedDocs={analyzedDocs} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="workbench" className="space-y-6">
                <Card>
                  <CardContent>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <SectionLabel>Research export</SectionLabel>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Download tidy CSVs or generate a printable summary
                          report for your research notes
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <ResearchDataExportButton docs={analyzedDocs} />
                        <ResearchReportButton />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <SectionLabel>Co-occurrence matrix</SectionLabel>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Top entities by document frequency — diagonal shows doc
                      count, off-diagonal shows shared-document co-occurrence
                    </p>
                    <div className="mt-4">
                      <CooccurrenceMatrixPanel docs={analyzedDocs} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <SectionLabel>Entity statistics</SectionLabel>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Sortable library-wide entity metrics with CSV export
                    </p>
                    <div className="mt-4">
                      <EntityStatisticsTable docs={analyzedDocs} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : null}
        </div>
      </div>
    </div>
  );
}
