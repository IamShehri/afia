import {
  GitBranch,
  ShieldCheck,
  Cpu,
  Wifi,
  PanelLeft,
  Sparkles,
} from "lucide-react";
import { useShell } from "@/stores/shell-store";
import { cn } from "@/lib/utils";

function StatusItem({
  icon: Icon,
  children,
  className,
  onClick,
  title,
}: {
  icon: typeof GitBranch;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  title?: string;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      title={title}
      className={cn(
        "flex items-center gap-1.5 rounded px-1.5 py-0.5 text-2xs font-medium text-muted-foreground transition-colors",
        onClick && "hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      <Icon className="size-3" />
      {children}
    </Comp>
  );
}

export function StatusBar() {
  const { toggleSecondary, secondaryOpen } = useShell();
  return (
    <footer className="flex h-7 shrink-0 items-center gap-1 border-t border-border bg-background px-2 text-2xs">
      <StatusItem
        icon={PanelLeft}
        onClick={toggleSecondary}
        title="Toggle context panel"
      >
        {secondaryOpen ? "Hide context" : "Show context"}
      </StatusItem>
      <span className="mx-1 h-3 w-px bg-border" />
      <StatusItem icon={GitBranch}>main · synced</StatusItem>
      <StatusItem icon={ShieldCheck} className="text-success">
        HIPAA compliant
      </StatusItem>

      <div className="ml-auto flex items-center gap-1">
        <StatusItem icon={Sparkles} className="text-primary">
          AI ready · 3 models
        </StatusItem>
        <span className="mx-1 h-3 w-px bg-border" />
        <StatusItem icon={Cpu}>Local · 24ms</StatusItem>
        <StatusItem icon={Wifi} className="text-success">
          Connected
        </StatusItem>
      </div>
    </footer>
  );
}
