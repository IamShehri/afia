import { TopBar } from "./TopBar";
import { BreadcrumbBar } from "./BreadcrumbBar";
import { PrimaryRail } from "./PrimaryRail";
import { SecondaryBar } from "./SecondaryBar";
import { Inspector } from "./Inspector";
import { StatusBar } from "./StatusBar";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { secondaryCollapsed, toggleSecondary } = useWorkspace();

  return (
    <div className="flex h-screen flex-col bg-background">
      <TopBar />
      <BreadcrumbBar />

      {/* Main workspace grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Primary rail */}
        <PrimaryRail />

        {/* Secondary sidebar (context-dependent) */}
        <SecondaryBar
          collapsed={secondaryCollapsed}
          onToggleCollapse={toggleSecondary}
        />

        {/* Workspace (main content area) */}
        <div className="flex-1 overflow-auto">
          <div className="h-full">{children}</div>
        </div>

        {/* Inspector slide-over (right) */}
        <Inspector />
      </div>

      {/* Status bar */}
      <StatusBar />
    </div>
  );
}
