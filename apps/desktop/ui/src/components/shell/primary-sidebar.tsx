import { NavLink } from "react-router-dom";
import { ChevronsLeft, Hospital, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { primaryNav, footerNav } from "@/data/navigation";
import { useWorkspace } from "@/providers/workspace-provider";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import { Avatar } from "@/components/ui/avatar";

export function PrimarySidebar() {
  const { sidebarCollapsed, toggleSidebar } = useWorkspace();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 68 : 248 }}
      transition={{ type: "spring", stiffness: 380, damping: 34 }}
      className="relative z-20 flex h-full shrink-0 flex-col border-r border-border bg-surface"
    >
      {/* Workspace switcher */}
      <div className="flex h-14 items-center gap-2.5 px-3">
        <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm ring-1 ring-inset ring-white/10">
          <Hospital className="h-[18px] w-[18px]" />
        </button>
        {!sidebarCollapsed && (
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[13px] font-semibold leading-tight">
              Mercy General
            </span>
            <span className="truncate text-[11px] text-muted-foreground">
              North Tower · Acute
            </span>
          </div>
        )}
      </div>

      {/* Quick action */}
      <div className="px-3 pb-2">
        <button
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-surface-raised text-[13px] font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground",
            sidebarCollapsed ? "justify-center px-0" : "px-3",
          )}
        >
          <Plus className="h-4 w-4 text-primary" />
          {!sidebarCollapsed && <span>New encounter</span>}
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {primaryNav.map((group) => (
          <div key={group.id} className="mb-4">
            {!sidebarCollapsed && (
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.label}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <li key={item.id}>
                  <SidebarLink item={item} collapsed={sidebarCollapsed} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-3 py-3">
        <ul className="mb-2 flex flex-col gap-0.5">
          {footerNav.map((item) => (
            <li key={item.id}>
              <SidebarLink item={item} collapsed={sidebarCollapsed} />
            </li>
          ))}
        </ul>
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2 py-1.5",
            sidebarCollapsed && "justify-center px-0",
          )}
        >
          <Avatar name="Dr. Lin" size="sm" status="online" />
          {!sidebarCollapsed && (
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13px] font-medium leading-tight">
                Dr. Evelyn Lin
              </span>
              <span className="truncate text-[11px] text-muted-foreground">
                Attending · Cardiology
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-16 z-30 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface-raised text-muted-foreground shadow-sm transition-colors hover:text-foreground"
      >
        <ChevronsLeft
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            sidebarCollapsed && "rotate-180",
          )}
        />
      </button>
    </motion.aside>
  );
}

function SidebarLink({
  item,
  collapsed,
}: {
  item: import("@/data/navigation").NavItem;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const content = (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      className={({ isActive }) =>
        cn(
          "group relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium transition-colors",
          collapsed && "justify-center px-0",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="nav-active"
              className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
            />
          )}
          <Icon className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
          {!collapsed && item.badge != null && (
            <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-secondary px-1.5 text-[10px] font-semibold text-muted-foreground">
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip content={item.label} side="right">
        {content}
      </Tooltip>
    );
  }
  return content;
}
