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
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  shortcut?: string;
}

export const primaryNav: NavItem[] = [
  { id: "home", label: "Home", href: "/", icon: LayoutGrid, shortcut: "G H" },
  { id: "patients", label: "Patients", href: "/patients", icon: Users, shortcut: "G P" },
  { id: "schedule", label: "Schedule", href: "/schedule", icon: CalendarDays, shortcut: "G S" },
  { id: "inbox", label: "Inbox", href: "/inbox", icon: Inbox, shortcut: "G I" },
  { id: "documents", label: "Documents", href: "/documents", icon: FileText, shortcut: "G D" },
  { id: "analytics", label: "Analytics Lab", href: "/analytics", icon: BarChart3 },
  { id: "research", label: "My Research", href: "/research", icon: ClipboardList, shortcut: "G R" },
  { id: "batch", label: "Batch Process", href: "/batch", icon: Layers, shortcut: "G B" },
  { id: "compare", label: "Compare Models", href: "/compare", icon: GitCompare, shortcut: "G C" },
  { id: "deidentify", label: "De-identify", href: "/deidentify", icon: ShieldOff },
  { id: "insights", label: "Insights", href: "/insights", icon: LineChart, shortcut: "G N" },
];

export const aiNav: NavItem = {
  id: "assistant",
  label: "AFIA Assistant",
  href: "/assistant",
  icon: Sparkles,
  shortcut: "⌘J",
};

export const settingsNav: NavItem = {
  id: "settings",
  label: "Settings",
  href: "/settings",
  icon: Settings,
  shortcut: "G ,",
};
