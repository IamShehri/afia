import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FlaskConical,
  Pill,
  FileText,
  Activity,
  MessagesSquare,
  Sparkles,
  Settings,
  Stethoscope,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  shortcut?: string;
}

export interface NavGroup {
  id: string;
  label?: string;
  items: NavItem[];
}

export const primaryNav: NavGroup[] = [
  {
    id: "workspace",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, shortcut: "1" },
      { id: "patients", label: "Patients", icon: Users, badge: "248", shortcut: "2" },
      { id: "schedule", label: "Schedule", icon: CalendarDays, shortcut: "3" },
      { id: "encounters", label: "Encounters", icon: Stethoscope, shortcut: "4" },
    ],
  },
  {
    id: "clinical",
    label: "Clinical",
    items: [
      { id: "labs", label: "Labs & Results", icon: FlaskConical, badge: "12" },
      { id: "medications", label: "Medications", icon: Pill },
      { id: "documents", label: "Documents", icon: FileText },
      { id: "tasks", label: "Tasks", icon: ClipboardList, badge: "7" },
    ],
  },
  {
    id: "intelligence",
    label: "Intelligence",
    items: [
      { id: "ai-runs", label: "AI Runs", icon: Activity },
      { id: "assistant", label: "Assistant", icon: Sparkles },
      { id: "messages", label: "Messages", icon: MessagesSquare, badge: "3" },
    ],
  },
];

export const footerNav: NavItem[] = [
  { id: "settings", label: "Settings", icon: Settings, shortcut: "," },
];

export function findNavItem(id: string): NavItem | undefined {
  for (const group of primaryNav) {
    const found = group.items.find((i) => i.id === id);
    if (found) return found;
  }
  return footerNav.find((i) => i.id === id);
}
