import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FlaskConical,
  Pill,
  MessagesSquare,
  FileText,
  Activity,
  Sparkles,
  Settings,
  LifeBuoy,
  Stethoscope,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  to: string;
  badge?: string | number;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

export const primaryNav: NavGroup[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "dashboard", label: "Overview", icon: LayoutDashboard, to: "/" },
      { id: "patients", label: "Patients", icon: Users, to: "/patients", badge: 8 },
      { id: "schedule", label: "Schedule", icon: CalendarDays, to: "/schedule" },
      { id: "encounters", label: "Encounters", icon: Stethoscope, to: "/encounters" },
    ],
  },
  {
    id: "clinical",
    label: "Clinical",
    items: [
      { id: "labs", label: "Labs", icon: FlaskConical, to: "/labs", badge: 3 },
      { id: "medications", label: "Medications", icon: Pill, to: "/medications" },
      { id: "orders", label: "Orders", icon: ClipboardList, to: "/orders" },
      { id: "documents", label: "Documents", icon: FileText, to: "/documents" },
    ],
  },
  {
    id: "intelligence",
    label: "Intelligence",
    items: [
      { id: "assistant", label: "AFIA Assistant", icon: Sparkles, to: "/assistant" },
      { id: "signals", label: "Signals", icon: Activity, to: "/signals" },
      { id: "messages", label: "Messages", icon: MessagesSquare, to: "/messages", badge: 2 },
    ],
  },
];

export const footerNav: NavItem[] = [
  { id: "settings", label: "Settings", icon: Settings, to: "/settings" },
  { id: "support", label: "Help & Support", icon: LifeBuoy, to: "/support" },
];
