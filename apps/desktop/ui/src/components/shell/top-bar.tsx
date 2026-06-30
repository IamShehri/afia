import { useLocation } from "react-router-dom";
import { Search, Bell, Sparkles, Sun, Moon, PanelRight, ChevronRight } from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
import { useTheme } from "@/providers/theme-provider";
import { Kbd, Tooltip } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

const routeTitles: Record<string, string> = {
  "/": "Overview",
  "/patients": "Patients",
  "/schedule": "Schedule",
  "/encounters": "Encounters",
  "/labs": "Labs",
  "/medications": "Medications",
  "/orders": "Orders",
  "/documents": "Documents",
  "/assistant": "AFIA Assistant",
  "/signals": "Signals",
  "/messages": "Messages",
  "/settings": "Settings",
  "/support": "Help & Support",
};

export function TopBar() {
  const { setCommandOpen, toggleAssistant, toggleInspector } = useWorkspace();
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const title = routeTitles[pathname] ?? "Workspace";

  return (
    <header className="glass z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
      {/* Breadcrumbs */}
      <div className="flex min-w-0 items-center gap-1.5 text-[13px]">
        <span className="text-muted-foreground">Mercy General</span>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
        <span className="truncate font-medium text-foreground">{title}</span>
      </div>

      {/* Global search / command */}
      <button
        onClick={() => setCommandOpen(true)}
        className="group ml-4 flex h-9 max-w-md flex-1 items-center gap-2.5 rounded-lg border border-border bg-surface-inset px-3 text-[13px] text-muted-foreground transition-colors hover:border-border hover:bg-surface-raised"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Search patients, orders, notes…</span>
        <span className="flex items-center gap-1">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <Tooltip content="Ask AFIA">
          <Button variant="ghost" size="sm" className="gap-1.5 text-primary" onClick={toggleAssistant}>
            <Sparkles className="h-4 w-4" />
            <span className="hidden md:inline">Ask AFIA</span>
          </Button>
        </Tooltip>

        <Tooltip content={theme === "dark" ? "Light mode" : "Dark mode"}>
          <Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </Button>
        </Tooltip>

        <Tooltip content="Notifications">
          <Button variant="ghost" size="icon-sm" aria-label="Notifications" className="relative">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive ring-2 ring-background" />
          </Button>
        </Tooltip>

        <Tooltip content="Toggle inspector">
          <Button variant="ghost" size="icon-sm" onClick={toggleInspector} aria-label="Toggle inspector">
            <PanelRight className="h-[18px] w-[18px]" />
          </Button>
        </Tooltip>

        <div className="mx-1 h-6 w-px bg-border" />

        <button className="rounded-full ring-offset-background transition-opacity hover:opacity-90">
          <Avatar name="Dr. Lin" size="sm" status="online" />
        </button>
      </div>
    </header>
  );
}
