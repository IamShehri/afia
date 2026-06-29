import { CalendarDays, Filter, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShell } from "@/stores/shell-store";
import { ActivityFeed } from "./activity-feed";
import { AiInsights, ScheduleCard } from "./ai-insights";
import { AcuityChart, ThroughputChart, VolumeChart } from "./charts";
import { PatientTable } from "./patient-table";
import { StatCards } from "./stat-cards";

export function DashboardPage() {
  const { toggleAssistant } = useShell();
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>Monday, June 29</span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground text-balance">
            Good morning, Dr. Reyes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            You have 4 appointments and 2 critical alerts that need attention.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button size="sm" className="gap-2" onClick={toggleAssistant}>
            <Sparkles className="h-4 w-4" />
            Ask AFIA
          </Button>
        </div>
      </header>

      <StatCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <VolumeChart />
        <AcuityChart />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PatientTable />
        <AiInsights />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ThroughputChart />
        <ScheduleCard />
        <ActivityFeed />
      </div>
    </div>
  );
}
