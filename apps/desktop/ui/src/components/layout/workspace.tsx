import { motion } from "framer-motion";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  FileText,
  FlaskConical,
  MessagesSquare,
  Pill,
  Settings,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { PlaceholderPage } from "@/features/placeholder-page";
import { useShell } from "@/stores/shell-store";

const placeholders: Record<string, { title: string; description: string; icon: any }> = {
  patients: { title: "Patients", description: "Unified patient panel and longitudinal records", icon: Users },
  schedule: { title: "Schedule", description: "Appointments, rooms, and provider availability", icon: CalendarDays },
  encounters: { title: "Encounters", description: "Active and past clinical encounters", icon: Stethoscope },
  labs: { title: "Labs & Results", description: "Diagnostic results with AI triage", icon: FlaskConical },
  medications: { title: "Medications", description: "Orders, reconciliation, and interactions", icon: Pill },
  documents: { title: "Documents", description: "Notes, summaries, and clinical paperwork", icon: FileText },
  tasks: { title: "Tasks", description: "Care-team to-dos and follow-ups", icon: ClipboardList },
  "ai-runs": { title: "AI Runs", description: "History of automated clinical workflows", icon: Activity },
  assistant: { title: "Assistant", description: "Your AI clinical copilot", icon: Sparkles },
  messages: { title: "Messages", description: "Secure care-team messaging", icon: MessagesSquare },
  settings: { title: "Settings", description: "Workspace, security, and integrations", icon: Settings },
};

export function Workspace() {
  const { activeModule } = useShell();
  const placeholder = placeholders[activeModule];

  return (
    <ScrollArea className="h-full">
      <motion.div
        key={activeModule}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        {activeModule === "dashboard" ? (
          <DashboardPage />
        ) : placeholder ? (
          <PlaceholderPage title={placeholder.title} description={placeholder.description} icon={placeholder.icon} />
        ) : (
          <DashboardPage />
        )}
      </motion.div>
    </ScrollArea>
  );
}
