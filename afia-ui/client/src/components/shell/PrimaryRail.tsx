import { useLocation } from "wouter";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AfiaWordmark } from "@/components/brand/AfiaMark";
import { primaryNav, aiNav, settingsNav } from "@/data/nav";
import { patients } from "@/data/patients";
import { Monogram } from "@/components/primitives";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function PrimaryRail() {
  const [location, setLocation] = useLocation();
  const { pinned, togglePin, recents } = useWorkspace();

  const pinnedPatients = patients.filter((p) => pinned.includes(p.id));
  const recentPatients = patients.filter((p) => recents.includes(p.id));

  return (
    <div className="flex h-full w-14 flex-col gap-2 border-r border-hairline bg-rail px-1.5 py-3">
      {/* Logo */}
      <div className="mb-2 flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setLocation("/")}
              aria-label="Go to home"
              className="rounded-lg"
            >
              <AfiaWordmark className="text-primary" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">AFIA</TooltipContent>
        </Tooltip>
      </div>

      {/* Primary nav */}
      <div className="space-y-1">
        {primaryNav.map((n) => (
          <Tooltip key={n.id}>
            <TooltipTrigger asChild>
              <Button
                variant={location === n.href ? "default" : "ghost"}
                size="icon-sm"
                onClick={() => setLocation(n.href)}
                aria-label={n.label}
                className="rounded-lg"
              >
                <n.icon className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{n.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Separator */}
      <div className="my-1 h-px bg-hairline" />

      {/* Pinned patients */}
      {pinnedPatients.length > 0 && (
        <div className="space-y-1">
          {pinnedPatients.slice(0, 4).map((p) => (
            <Tooltip key={p.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setLocation(`/patients/${p.id}`)}
                  aria-label={`View patient ${p.name}`}
                  className="relative rounded-lg"
                >
                  <Monogram name={p.name} hue={p.riskScore * 3.6} size={20} />
                  <span
                    className={cn(
                      "absolute -right-0.5 -top-0.5 size-2 rounded-full",
                      p.risk === "critical"
                        ? "bg-destructive animate-signal"
                        : p.risk === "high"
                          ? "bg-risk-high"
                          : "bg-muted",
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="text-xs">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-muted-foreground">{p.id}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      )}

      {/* Recents */}
      {recentPatients.length > 0 && pinnedPatients.length < 4 && (
        <div className="space-y-1">
          {recentPatients.slice(0, 4 - pinnedPatients.length).map((p) => (
            <Tooltip key={p.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setLocation(`/patients/${p.id}`)}
                  aria-label={`View recent patient ${p.name}`}
                  className="relative rounded-lg opacity-60 hover:opacity-100"
                >
                  <Monogram name={p.name} hue={p.riskScore * 3.6} size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="text-xs">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-muted-foreground">Recent</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* AI + Settings */}
      <div className="space-y-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setLocation(aiNav.href)}
              aria-label={aiNav.label}
              className="rounded-lg"
            >
              <aiNav.icon className="size-5 text-ai" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{aiNav.label}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={location === settingsNav.href ? "default" : "ghost"}
              size="icon-sm"
              onClick={() => setLocation(settingsNav.href)}
              aria-label={settingsNav.label}
              className="rounded-lg"
            >
              <settingsNav.icon className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{settingsNav.label}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
