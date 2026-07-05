import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/primitives";
import { cn } from "@/lib/utils";
import {
  filterUserDocuments,
  listDocuments,
  type StoredDocument,
  type DocumentStatus,
} from "@/lib/documents";
import {
  FileText,
  Files,
  Sparkles,
  Clock,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

const STATUS_STYLES: Record<UserDocumentStatus, string> = {
  new: "border-info/25 bg-info/10 text-info",
  in_progress: "border-warning/25 bg-warning/10 text-warning",
  reviewed: "border-success/25 bg-success/10 text-success",
};

const STATUS_LABELS: Record<UserDocumentStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  reviewed: "Reviewed",
};

type UserDocumentStatus = Exclude<DocumentStatus, "artifact">;
type StatusFilter = "all" | UserDocumentStatus;

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "in_progress", label: "In Progress" },
  { id: "reviewed", label: "Reviewed" },
];

const EMPTY_MESSAGES: Record<StatusFilter, string> = {
  all: "No documents yet — upload your first PDF to get started",
  new: "No new documents yet",
  in_progress: "No documents in progress yet",
  reviewed: "No reviewed documents yet",
};

/* Compact relative-time formatter — no external dependency. */
function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.round(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day} day${day === 1 ? "" : "s"} ago`;
  const mon = Math.round(day / 30);
  if (mon < 12) return `${mon} month${mon === 1 ? "" : "s"} ago`;
  const yr = Math.round(mon / 12);
  return `${yr} year${yr === 1 ? "" : "s"} ago`;
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

export default function MyResearch() {
  const [, setLocation] = useLocation();
  const [allDocs, setAllDocs] = useState<StoredDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    let active = true;
    listDocuments()
      .then((docs) => {
        if (active) setAllDocs(filterUserDocuments(docs));
      })
      .catch(() => {
        if (active) setAllDocs([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(
    () => ({
      total: allDocs.length,
      new: allDocs.filter((d) => (d.status ?? "new") === "new").length,
      in_progress: allDocs.filter((d) => d.status === "in_progress").length,
      reviewed: allDocs.filter((d) => d.status === "reviewed").length,
    }),
    [allDocs],
  );

  const filtered = useMemo(() => {
    const list =
      statusFilter === "all"
        ? allDocs
        : allDocs.filter((d) => (d.status ?? "new") === statusFilter);
    return [...list].sort((a, b) => b.lastAccessedAt - a.lastAccessedAt);
  }, [allDocs, statusFilter]);

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <PageHeader
          title="My Research"
          subtitle="Track your document review progress"
        />

        {/* Row 1 — Summary stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Total Documents" value={counts.total} icon={Files} />
          <StatCard label="New" value={counts.new} icon={Sparkles} />
          <StatCard
            label="In Progress"
            value={counts.in_progress}
            icon={Clock}
          />
          <StatCard
            label="Reviewed"
            value={counts.reviewed}
            icon={CheckCircle2}
          />
        </div>

        {/* Row 2 — Filter tabs */}
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                statusFilter === f.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-elevated hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Row 3 — Document list */}
        {loading ? (
          <div className="rounded-lg border border-hairline">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse border-b border-hairline bg-elevated last:border-b-0"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-hairline bg-surface px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {EMPTY_MESSAGES[statusFilter]}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-hairline">
            {filtered.map((doc) => {
              const status = (doc.status ?? "new") as UserDocumentStatus;
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setLocation(`/documents?doc=${doc.id}`)}
                  className="flex w-full cursor-pointer items-center gap-3 border-b border-hairline px-2 py-3 text-left transition-colors last:border-b-0 hover:bg-elevated"
                >
                  <FileText className="size-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">
                        {doc.filename}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
                          STATUS_STYLES[status],
                        )}
                      >
                        {STATUS_LABELS[status]}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {doc.entities.length} entities · {doc.page_count} pages
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {relativeTime(doc.lastAccessedAt)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
