import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { patients, statusMeta, type Patient } from "@/data/mock";
import { useWorkspace } from "@/providers/workspace-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Sparkline } from "@/components/charts/sparkline";
import { Input } from "@/components/ui/input";
import { cn, formatRelativeTime } from "@/lib/utils";

type SortKey = "name" | "riskScore" | "status";

export function PatientTable() {
  const { setSelectedPatientId, setInspectorOpen, selectedPatientId } = useWorkspace();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("riskScore");
  const [asc, setAsc] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const rows = useMemo(() => {
    let data = [...patients];
    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.mrn.toLowerCase().includes(q) ||
          p.condition.toLowerCase().includes(q),
      );
    }
    data.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "riskScore") cmp = a.riskScore - b.riskScore;
      else cmp = a.status.localeCompare(b.status);
      return asc ? cmp : -cmp;
    });
    return data;
  }, [query, sortKey, asc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setAsc((v) => !v);
    else {
      setSortKey(key);
      setAsc(false);
    }
  }

  function openPatient(p: Patient) {
    setSelectedPatientId(p.id);
    setInspectorOpen(true);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const allSelected = selected.size === rows.length && rows.length > 0;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card surface-panel">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter patients…"
            className="h-8 pl-8 text-[13px]"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5">
          Columns
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 border-b border-border bg-primary/[0.06] px-3 py-2 text-[13px] animate-fade-in">
          <span className="font-medium text-primary">{selected.size} selected</span>
          <div className="h-4 w-px bg-border" />
          <button className="text-muted-foreground hover:text-foreground">Assign</button>
          <button className="text-muted-foreground hover:text-foreground">Flag</button>
          <button className="text-muted-foreground hover:text-foreground">Export</button>
          <button
            className="ml-auto text-muted-foreground hover:text-foreground"
            onClick={() => setSelected(new Set())}
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground/70">
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={allSelected}
                  onChange={() =>
                    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)))
                  }
                  className="h-3.5 w-3.5 rounded border-border accent-primary"
                />
              </th>
              <Th onClick={() => toggleSort("name")}>Patient</Th>
              <th className="px-3 py-2.5 font-semibold">Condition</th>
              <Th onClick={() => toggleSort("status")}>Status</Th>
              <th className="px-3 py-2.5 font-semibold">Room</th>
              <Th onClick={() => toggleSort("riskScore")} className="text-right">
                Risk
              </Th>
              <th className="px-3 py-2.5 font-semibold">Trend</th>
              <th className="px-3 py-2.5 font-semibold">Updated</th>
              <th className="w-10 px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const isSel = selected.has(p.id);
              const isOpen = selectedPatientId === p.id;
              return (
                <tr
                  key={p.id}
                  onClick={() => openPatient(p)}
                  className={cn(
                    "group cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40",
                    isOpen && "bg-primary/[0.05]",
                  )}
                >
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      aria-label={`Select ${p.name}`}
                      checked={isSel}
                      onChange={() => toggleSelect(p.id)}
                      className="h-3.5 w-3.5 rounded border-border accent-primary"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={p.name} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{p.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {p.mrn} · {p.age}
                          {p.sex}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[200px] px-3 py-2.5">
                    <p className="truncate text-muted-foreground">{p.condition}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant={statusMeta[p.status].variant}>
                      {statusMeta[p.status].label}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[12px] text-muted-foreground">
                    {p.room}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <RiskPill score={p.riskScore} />
                  </td>
                  <td className="px-3 py-2.5">
                    <Sparkline
                      data={p.vitalsTrend}
                      className="h-7 w-16"
                      color={
                        p.riskScore > 60
                          ? "hsl(var(--destructive))"
                          : p.riskScore > 35
                            ? "hsl(var(--warning))"
                            : "hsl(var(--success))"
                      }
                    />
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-muted-foreground">
                    {formatRelativeTime(new Date(p.lastUpdated))}
                  </td>
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Row actions"
                      className="opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer / pagination */}
      <div className="flex items-center justify-between border-t border-border px-3 py-2.5 text-[12px] text-muted-foreground">
        <span>
          Showing <span className="font-medium text-foreground">{rows.length}</span> of{" "}
          {patients.length} patients
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function Th({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <th className={cn("px-3 py-2.5 font-semibold", className)}>
      <button
        onClick={onClick}
        className="inline-flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-foreground"
      >
        {children}
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      </button>
    </th>
  );
}

function RiskPill({ score }: { score: number }) {
  const tone =
    score > 60
      ? "text-destructive"
      : score > 35
        ? "text-warning"
        : "text-success";
  return (
    <span className={cn("font-mono text-[13px] font-semibold tabular-nums", tone)}>
      {score}
    </span>
  );
}
