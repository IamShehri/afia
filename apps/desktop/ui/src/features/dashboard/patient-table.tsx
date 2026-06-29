import { ArrowUpRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useShell } from "@/stores/shell-store";
import { cn } from "@/lib/utils";
import { patients, statusLabels, type Patient, type PatientStatus } from "@/lib/mock-data";

const statusStyles: Record<PatientStatus, string> = {
  stable: "bg-success/10 text-success border-success/20",
  monitoring: "bg-cyan/10 text-cyan border-cyan/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  discharged: "bg-muted text-muted-foreground border-border",
};

function riskTone(risk: number) {
  if (risk >= 75) return "text-destructive";
  if (risk >= 50) return "text-warning";
  return "text-success";
}

function PatientRow({ patient }: { patient: Patient }) {
  const { setSelectedPatientId, selectedPatientId, setInspectorOpen } = useShell();
  const active = selectedPatientId === patient.id;
  const handleSelect = () => {
    setSelectedPatientId(patient.id);
    setInspectorOpen(true);
  };
  return (
    <button
      type="button"
      onClick={handleSelect}
      className={cn(
        "group grid w-full grid-cols-[1.6fr_1fr_0.8fr_0.7fr_auto] items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
        active ? "bg-accent/10 ring-1 ring-inset ring-accent/30" : "hover:bg-muted/60",
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <span
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-medium",
            "bg-gradient-to-br from-primary/20 to-cyan/20 text-foreground",
          )}
          aria-hidden
        >
          {patient.name.split(" ").map((n) => n[0]).join("")}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{patient.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {patient.mrn} · {patient.age}
            {patient.sex}
          </p>
        </div>
      </div>
      <div className="min-w-0">
        <p className="truncate text-foreground">{patient.condition}</p>
        <p className="truncate text-xs text-muted-foreground">{patient.provider}</p>
      </div>
      <div>
        <Badge variant="outline" className={cn("font-medium", statusStyles[patient.status])}>
          {statusLabels[patient.status]}
        </Badge>
      </div>
      <div className={cn("text-sm font-semibold tabular-nums", riskTone(patient.risk))}>{patient.risk}</div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="hidden sm:inline">{patient.lastSeen}</span>
        <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </button>
  );
}

export function PatientTable() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.condition.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <Card className="col-span-2 flex flex-col">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Active patients</CardTitle>
            <CardDescription>Live panel with AI-computed risk scores</CardDescription>
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patients"
              className="h-9 pl-8"
              aria-label="Search patients"
            />
          </div>
        </div>
      </CardHeader>
      <div className="px-3 pb-2">
        <div className="grid grid-cols-[1.6fr_1fr_0.8fr_0.7fr_auto] gap-3 px-3 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>Patient</span>
          <span>Condition</span>
          <span>Status</span>
          <span>Risk</span>
          <span className="text-right">Seen</span>
        </div>
        <ScrollArea className="h-[300px] pr-1">
          <div className="space-y-0.5">
            {filtered.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">No patients match “{query}”.</p>
            ) : (
              filtered.map((patient) => <PatientRow key={patient.id} patient={patient} />)
            )}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
}
