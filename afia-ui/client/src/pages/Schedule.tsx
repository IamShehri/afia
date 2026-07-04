import { useLocation } from "wouter";
import { appointments } from "@/data/workspace";
import { fmtTime, fmtDate } from "@/data/workspace";
import { Monogram, StatusChip, PageHeader } from "@/components/primitives";
import { Calendar } from "lucide-react";

export default function Schedule() {
  const [, setLocation] = useLocation();

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-hairline px-6 py-4">
        <PageHeader title="Schedule" subtitle="Today's appointments" />
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-3">
          {appointments.map((a) => (
            <div
              key={a.id}
              onClick={() => setLocation(`/patients/${a.patientId}`)}
              className="border border-hairline rounded-lg bg-surface p-4 hover:bg-elevated transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Monogram name={a.patientName} size={32} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{a.patientName}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {a.kind} • {a.location}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="font-mono text-sm font-semibold text-primary">
                      {fmtTime(a.start)}
                    </span>
                    <StatusChip status={a.status} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
