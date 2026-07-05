import { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Monogram,
  RiskBadge,
  PageHeader,
  SectionLabel,
} from "@/components/primitives";
import { inboxItems } from "@/data/workspace";
import { patients } from "@/data/patients";
import type { Patient } from "@/data/types";
import { filterUserDocuments, listDocuments, type DocumentStatus, type StoredDocument } from "@/lib/documents";
import { documentStudioHref } from "@/lib/document-navigation";
import { useTeamWorkspace } from "@/contexts/TeamWorkspaceContext";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ShareMenu } from "@/components/ShareMenu";
import { APP_PUBLIC_URL } from "@/const";
import { HOME_SHARE_TEXT } from "@/lib/social-share";
import {
  FileText,
  MessageSquare,
  Boxes,
  AlertCircle,
  Inbox,
  Upload,
  type LucideIcon,
} from "lucide-react";

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const quickActions: QuickAction[] = [
  {
    title: "Analyze Document",
    description: "Upload a clinical PDF and detect entities",
    href: "/documents",
    icon: FileText,
  },
  {
    title: "Ask AFIA",
    description: "Analyze clinical text with OpenMed models",
    href: "/assistant",
    icon: MessageSquare,
  },
  {
    title: "Browse Models",
    description: "Explore available NER and PII models",
    href: "/models",
    icon: Boxes,
  },
];

type UserDocumentStatus = Exclude<DocumentStatus, "artifact">;

const STATUS_LABELS: Record<UserDocumentStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  reviewed: "Reviewed",
};

const STATUS_STYLES: Record<UserDocumentStatus, string> = {
  new: "border-info/25 bg-info/10 text-info",
  in_progress: "border-warning/25 bg-warning/10 text-warning",
  reviewed: "border-success/25 bg-success/10 text-success",
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

export default function Home() {
  const [, setLocation] = useLocation();
  const { openInspector, pushRecent } = useWorkspace();
  const { activeWorkspaceId, activeWorkspace } = useTeamWorkspace();

  const [recentDocs, setRecentDocs] = useState<StoredDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    let active = true;
    listDocuments({ workspaceId: activeWorkspaceId })
      .then((docs) => {
        if (active) setRecentDocs(filterUserDocuments(docs).slice(0, 5));
      })
      .catch(() => {
        if (active) setRecentDocs([]);
      })
      .finally(() => {
        if (active) setLoadingDocs(false);
      });
    return () => {
      active = false;
    };
  }, [activeWorkspaceId]);

  const criticalPatients = patients
    .filter((p: Patient) => p.risk === "critical")
    .slice(0, 5);
  const unreadInbox = inboxItems.filter((i) => i.unread).slice(0, 4);

  const handlePatientClick = (id: string) => {
    pushRecent(id);
    openInspector(id);
    setLocation(`/patients/${id}`);
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <PageHeader
            title="Welcome back"
            subtitle={
              activeWorkspace
                ? `${activeWorkspace.name} · ${new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}`
                : new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })
            }
          />
          <ShareMenu text={HOME_SHARE_TEXT} url={APP_PUBLIC_URL} />
        </div>

        {/* SECTION 1 — Quick Actions */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {quickActions.map((a) => (
            <button
              key={a.href}
              type="button"
              onClick={() => setLocation(a.href)}
              className="text-left"
            >
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="space-y-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-lg border border-ai/25 bg-ai/10 text-ai">
                    <a.icon className="size-5" />
                  </span>
                  <div>
                    <div className="text-base font-semibold tracking-tight">
                      {a.title}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {a.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>

        {/* SECTION 2 — Recent Documents */}
        <div>
          <SectionLabel>Recent Documents</SectionLabel>
          <div className="mt-2">
            {loadingDocs ? (
              <div className="flex gap-3 overflow-x-auto">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-28 w-[200px] shrink-0 animate-pulse rounded-lg border border-hairline bg-elevated"
                  />
                ))}
              </div>
            ) : recentDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-hairline bg-surface px-6 py-10 text-center">
                <span className="inline-flex size-10 items-center justify-center rounded-lg border border-hairline bg-elevated text-muted-foreground">
                  <Upload className="size-5" />
                </span>
                <p className="text-sm text-muted-foreground">
                  No documents yet — upload your first PDF to get started
                </p>
                <Button onClick={() => setLocation("/documents")}>
                  <FileText className="size-4" />
                  Analyze Document
                </Button>
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto">
                {recentDocs.map((doc) => {
                  const status = (doc.status ?? "new") as UserDocumentStatus;
                  return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() =>
                      setLocation(
                        documentStudioHref(doc, activeWorkspaceId),
                      )
                    }
                    className="w-[200px] shrink-0 cursor-pointer rounded-lg border border-hairline bg-surface p-3 text-left transition-colors hover:bg-elevated"
                  >
                    <FileText className="size-5 text-muted-foreground" />
                    <div className="mt-2 truncate text-sm font-medium">
                      {doc.filename}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
                          STATUS_STYLES[status],
                        )}
                      >
                        {STATUS_LABELS[status]}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {relativeTime(doc.lastAccessedAt)}
                      </span>
                    </div>
                  </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3 — Recent Activity */}
        <div>
          <SectionLabel>Recent Activity</SectionLabel>
          <div className="mt-2">
            <div className="rounded-lg border border-hairline bg-surface px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Your analysis history will appear here
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 4 — Patient Overview */}
        <div>
          <SectionLabel>Patient Overview</SectionLabel>
          <div className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Critical Patients */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-5 text-destructive" />
                  <CardTitle>Critical Attention</CardTitle>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {criticalPatients.length} patients
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {criticalPatients.map((p: Patient) => (
                    <button
                      key={p.id}
                      onClick={() => handlePatientClick(p.id)}
                      className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-elevated transition-colors text-left"
                    >
                      <Monogram name={p.name} size={24} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {p.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {p.condition}
                        </div>
                      </div>
                      <RiskBadge risk={p.risk} showLabel={false} />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Unread Inbox */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Inbox className="size-5 text-primary" />
                  <CardTitle>Inbox</CardTitle>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {unreadInbox.length} unread
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {unreadInbox.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setLocation("/inbox")}
                      className="w-full text-left p-2 rounded-md hover:bg-elevated transition-colors"
                    >
                      <div className="text-sm font-medium line-clamp-1">
                        {item.title}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {item.preview}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
