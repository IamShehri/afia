import { Outlet } from "react-router-dom";
import { PrimarySidebar } from "./primary-sidebar";
import { SecondarySidebar } from "./secondary-sidebar";
import { TopBar } from "./top-bar";
import { StatusBar } from "./status-bar";
import { Inspector } from "./inspector";
import { AssistantPanel } from "./assistant-panel";
import { CommandPalette } from "./command-palette";

export function AppShell() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <PrimarySidebar />
      <SecondarySidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 overflow-y-auto">
            <Outlet />
          </main>
          <Inspector />
        </div>
        <StatusBar />
      </div>

      <AssistantPanel />
      <CommandPalette />
    </div>
  );
}
