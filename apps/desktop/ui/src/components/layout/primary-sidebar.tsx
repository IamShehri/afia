import { motion } from "framer-motion";
import {
  ChevronsUpDown,
  PanelLeftClose,
  PanelLeft,
  Plus,
  Check,
} from "lucide-react";
import { primaryNav, footerNav, type NavItem } from "@/lib/navigation";
import { useShell } from "@/stores/shell-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const workspaces = [
  { id: "mercy", name: "Mercy General", initials: "MG", active: true },
  { id: "northside", name: "Northside Clinic", initials: "NC", active: false },
  { id: "research", name: "Research Unit", initials: "RU", active: false },
];

function NavButton({
  item,
  collapsed,
}: {
  item: NavItem;
  collapsed: boolean;
}) {
  const { activeModule, setActiveModule } = useShell();
  const active = activeModule === item.id;
  const Icon = item.icon;

  const button = (
    <button
      onClick={() => setActiveModule(item.id)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex w-full items-center gap-2.5 rounded-md px-2.5 text-sm font-medium outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring",
        collapsed ? "h-9 justify-center" : "h-8",
        active
          ? "bg-surface-raised text-foreground shadow-soft"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {active && (
        <motion.span
          layoutId="primary-active"
          className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
      )}
      <Icon
        className={cn(
          "size-[18px] shrink-0 transition-colors",
          active ? "text-primary" : "text-muted-foreground",
        )}
      />
      {!collapsed && (
        <>
          <span className="truncate">{item.label}</span>
          {item.badge && (
            <Badge variant="neutral" className="ml-auto tabular-nums">
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.label}
          {item.badge && (
            <span className="text-muted-foreground">{item.badge}</span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }
  return button;
}

export function PrimarySidebar() {
  const { primaryCollapsed, togglePrimary } = useShell();

  return (
    <motion.aside
      animate={{ width: primaryCollapsed ? 60 : 248 }}
      transition={{ type: "spring", stiffness: 400, damping: 38 }}
      className="relative z-20 flex h-full flex-col border-r border-border bg-background"
    >
      {/* Workspace switcher */}
      <div className={cn("p-2.5", primaryCollapsed && "px-2")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "no-drag flex w-full items-center gap-2.5 rounded-md p-1.5 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                primaryCollapsed && "justify-center",
              )}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-2xs font-bold text-primary-foreground shadow-soft">
                MG
              </span>
              {!primaryCollapsed && (
                <>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[0.8125rem] font-semibold text-foreground">
                      Mercy General
                    </span>
                    <span className="truncate text-2xs text-muted-foreground">
                      Cardiology · West Wing
                    </span>
                  </span>
                  <ChevronsUpDown className="ml-auto size-3.5 text-muted-foreground" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60">
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            {workspaces.map((ws) => (
              <DropdownMenuItem key={ws.id} className="gap-2.5">
                <span className="flex size-6 items-center justify-center rounded bg-muted text-2xs font-semibold text-foreground">
                  {ws.initials}
                </span>
                <span className="flex-1">{ws.name}</span>
                {ws.active && <Check className="size-4 text-primary" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Plus className="size-4" />
              New workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Primary"
        className="flex-1 overflow-y-auto px-2.5 pb-2"
      >
        {primaryNav.map((group) => (
          <div key={group.id} className="mb-4">
            {group.label && !primaryCollapsed && (
              <p className="px-2.5 pb-1.5 pt-2 text-2xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.label}
              </p>
            )}
            {group.label && primaryCollapsed && (
              <div className="mx-auto mb-1.5 mt-2 h-px w-5 bg-border" />
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <NavButton
                  key={item.id}
                  item={item}
                  collapsed={primaryCollapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-2.5">
        <div className="flex flex-col gap-0.5">
          {footerNav.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              collapsed={primaryCollapsed}
            />
          ))}
        </div>
        <Button
          variant="ghost"
          size={primaryCollapsed ? "icon-sm" : "sm"}
          onClick={togglePrimary}
          className={cn(
            "mt-1 text-muted-foreground",
            !primaryCollapsed && "w-full justify-start",
          )}
          aria-label={primaryCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {primaryCollapsed ? (
            <PanelLeft className="size-[18px]" />
          ) : (
            <>
              <PanelLeftClose className="size-[18px]" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </motion.aside>
  );
}
