import { Activity, BedDouble, Clock, Users, Plus, Download } from "lucide-react";
import { PageHeader } from "@/components/workspace/page-header";
import { StatCard } from "@/components/workspace/stat-card";
import { CensusChart } from "@/components/charts/census-chart";
import { PatientTable } from "@/components/workspace/patient-table";
import { AiSuggestions } from "@/components/workspace/ai-suggestions";
import { ActivityFeed } from "@/components/workspace/activity-feed";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 p-5 lg:p-6">
      <PageHeader
        title="Good morning, Dr. Lin"
        description="Here's what's happening across the North Tower acute unit."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New encounter
            </Button>
          </>
        }
      />

      {/* Stat row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active patients"
          value="42"
          delta={4}
          icon={Users}
          trend={[36, 38, 37, 40, 39, 41, 42]}
        />
        <StatCard
          label="Avg. wait time"
          value="18m"
          delta={-12}
          icon={Clock}
          trend={[28, 26, 24, 22, 21, 19, 18]}
          positiveIsGood={false}
        />
        <StatCard
          label="Bed occupancy"
          value="84%"
          delta={3}
          icon={BedDouble}
          trend={[78, 80, 79, 82, 81, 83, 84]}
        />
        <StatCard
          label="Critical alerts"
          value="3"
          delta={-25}
          icon={Activity}
          trend={[6, 5, 5, 4, 4, 3, 3]}
          positiveIsGood={false}
        />
      </div>

      {/* Chart + AI */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Unit census</CardTitle>
              <CardDescription>Admissions and discharges, last 7 days</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" /> Admissions
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-accent" /> Discharges
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <CensusChart />
          </CardContent>
        </Card>

        <AiSuggestions />
      </div>

      {/* Patient table + activity */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="flex flex-col gap-3 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight">Patient roster</h2>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </div>
          <PatientTable />
        </div>
        <ActivityFeed />
      </div>
    </div>
  );
}
