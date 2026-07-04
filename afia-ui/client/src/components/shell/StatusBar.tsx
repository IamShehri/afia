import { Kbd } from "@/components/primitives";

export function StatusBar() {
  return (
    <div className="flex h-8 items-center justify-between gap-4 border-t border-hairline bg-surface px-4 text-xs text-muted-foreground">
      {/* Left: status indicators */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-success animate-pulse" />
          <span>Connected</span>
        </div>
      </div>

      {/* Center: environment */}
      <div className="flex-1 text-center">
        <span className="font-mono text-[10px]">AFIA v1.0 • Production</span>
      </div>

      {/* Right: shortcuts hint */}
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline">Quick access:</span>
        <Kbd>⌘K</Kbd>
        <Kbd className="hidden sm:inline-flex">⌘J</Kbd>
      </div>
    </div>
  );
}
