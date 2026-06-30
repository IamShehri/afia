import { Activity, Cloud, ShieldCheck, Wifi, Sparkles } from "lucide-react";

export function StatusBar() {
  return (
    <footer className="flex h-7 shrink-0 items-center gap-4 border-t border-border bg-surface px-4 text-[11px] text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        All systems operational
      </span>
      <span className="flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5" />
        HIPAA session encrypted
      </span>
      <span className="hidden items-center gap-1.5 md:flex">
        <Activity className="h-3.5 w-3.5" />
        42 active patients
      </span>

      <div className="ml-auto flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          AFIA online
        </span>
        <span className="hidden items-center gap-1.5 md:flex">
          <Cloud className="h-3.5 w-3.5" />
          Synced 2s ago
        </span>
        <span className="flex items-center gap-1.5">
          <Wifi className="h-3.5 w-3.5" />
          Stable
        </span>
        <span className="font-mono">v1.0.0</span>
      </div>
    </footer>
  );
}
