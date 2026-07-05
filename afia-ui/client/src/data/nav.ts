import {
  LayoutGrid,
  Users,
  CalendarDays,
  Inbox,
  Sparkles,
  LineChart,
  FileText,
  ClipboardList,
  Layers,
  GitCompare,
  ShieldOff,
  BarChart3,
  Settings,
  Boxes,
  Network,
  Table2,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  shortcut?: string;
}

/** Slim left rail — Home, research library, settings. */
export const railNav: NavItem[] = [
  { id: "home", label: "Home", href: "/", icon: LayoutGrid, shortcut: "G H" },
  {
    id: "research",
    label: "My Research",
    href: "/research",
    icon: ClipboardList,
    shortcut: "G R",
  },
  {
    id: "settings",
    label: "Settings",
    href: "/settings",
    icon: Settings,
    shortcut: "G ,",
  },
];

/** Top bar → Studio menu. */
export const studioNav: NavItem[] = [
  {
    id: "documents",
    label: "Document Studio",
    href: "/documents",
    icon: FileText,
    shortcut: "G D",
  },
  {
    id: "batch",
    label: "Batch Process",
    href: "/batch",
    icon: Layers,
    shortcut: "G B",
  },
  {
    id: "deidentify",
    label: "De-identify",
    href: "/deidentify",
    icon: ShieldOff,
  },
  {
    id: "compare",
    label: "Model Compare",
    href: "/compare",
    icon: GitCompare,
    shortcut: "G C",
  },
  {
    id: "models",
    label: "Model Library",
    href: "/models",
    icon: Boxes,
  },
];

export const ANALYTICS_TABS = ["overview", "graph", "workbench"] as const;
export type AnalyticsTab = (typeof ANALYTICS_TABS)[number];

export function analyticsHref(tab: AnalyticsTab = "overview"): string {
  return `/analytics?tab=${tab}`;
}

/** Top bar → Lab menu (deep-links into Analytics tabs). */
export const labNav: NavItem[] = [
  {
    id: "analytics-overview",
    label: "Analytics Overview",
    href: analyticsHref("overview"),
    icon: BarChart3,
  },
  {
    id: "analytics-graph",
    label: "Entity Graph",
    href: analyticsHref("graph"),
    icon: Network,
  },
  {
    id: "analytics-workbench",
    label: "Workbench",
    href: analyticsHref("workbench"),
    icon: Table2,
  },
];

/** Command palette — clinical workspace pages (not in top menus). */
export const clinicalNav: NavItem[] = [
  { id: "patients", label: "Patients", href: "/patients", icon: Users, shortcut: "G P" },
  { id: "schedule", label: "Schedule", href: "/schedule", icon: CalendarDays, shortcut: "G S" },
  { id: "inbox", label: "Inbox", href: "/inbox", icon: Inbox, shortcut: "G I" },
  { id: "insights", label: "Insights", href: "/insights", icon: LineChart, shortcut: "G N" },
];

export const aiNav: NavItem = {
  id: "assistant",
  label: "AFIA Assistant",
  href: "/assistant",
  icon: Sparkles,
  shortcut: "⌘J",
};

/** @deprecated Use railNav — kept for any legacy imports during transition. */
export const settingsNav: NavItem = railNav[2]!;

export function parseAnalyticsTab(search: string): AnalyticsTab {
  const tab = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  ).get("tab");
  if (tab === "graph" || tab === "workbench" || tab === "overview") {
    return tab;
  }
  return "overview";
}

export function pathnameFromHref(href: string): string {
  return href.split("?")[0] ?? href;
}

export function isNavItemActive(location: string, href: string): boolean {
  const path = pathnameFromHref(href);
  if (path === "/") return location === "/";
  if (path === "/analytics") {
    if (!location.startsWith("/analytics")) return false;
    const wantedTab = new URLSearchParams(href.split("?")[1] ?? "").get("tab");
    const currentTab = parseAnalyticsTab(
      location.includes("?") ? location.slice(location.indexOf("?")) : "",
    );
    return (wantedTab ?? "overview") === currentTab;
  }
  return location === path || location.startsWith(`${path}/`);
}
