import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { railNav } from "@/data/nav";

export function PrimaryRail() {
  const [location, setLocation] = useLocation();

  return (
    <div className="flex h-full w-14 flex-col gap-2 border-r border-hairline bg-rail px-1.5 py-3">
      <div className="space-y-1">
        {railNav.map((item) => {
          const active =
            item.href === "/"
              ? location === "/"
              : location === item.href ||
                location.startsWith(`${item.href}/`);
          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={active ? "default" : "ghost"}
                  size="icon-sm"
                  onClick={() => setLocation(item.href)}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  className="rounded-lg"
                >
                  <item.icon className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
