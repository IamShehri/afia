import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { AiAssistantPanel } from "@/components/ai-assistant-panel";
import { CommandPalette } from "@/components/command-palette";
import { CommandBar } from "@/components/layout/command-bar";
import { Inspector } from "@/components/layout/inspector";
import { PrimarySidebar } from "@/components/layout/primary-sidebar";
import { SecondarySidebar } from "@/components/layout/secondary-sidebar";
import { StatusBar } from "@/components/layout/status-bar";
import { Workspace } from "@/components/layout/workspace";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { ShellProvider, useGlobalShortcuts } from "@/stores/shell-store";

function Shell() {
  const handleShortcuts = useGlobalShortcuts();
  useEffect(() => {
    window.addEventListener("keydown", handleShortcuts);
    return () => window.removeEventListener("keydown", handleShortcuts);
  }, [handleShortcuts]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground antialiased">
      <CommandBar />
      <div className="flex min-h-0 flex-1">
        <PrimarySidebar />
        <SecondarySidebar />
        <main className="relative min-w-0 flex-1 bg-canvas">
          <Workspace />
        </main>
        <AnimatePresence>
          <Inspector />
        </AnimatePresence>
      </div>
      <StatusBar />
      <CommandPalette />
      <AiAssistantPanel />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>
        <ShellProvider>
          <Shell />
        </ShellProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
