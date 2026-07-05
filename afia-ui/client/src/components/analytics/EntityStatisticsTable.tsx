import { useMemo, useState } from "react";
import Papa from "papaparse";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { logAction } from "@/lib/audit";
import {
  computeEntityStatistics,
  type AnalyzedDocSummary,
  type EntityStatRow,
} from "@/lib/analytics-library";
import { cn } from "@/lib/utils";

const columnHelper = createColumnHelper<EntityStatRow>();

interface EntityStatisticsTableProps {
  docs: AnalyzedDocSummary[];
}

export function EntityStatisticsTable({ docs }: EntityStatisticsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "documentCount", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");

  const rows = useMemo(() => computeEntityStatistics(docs), [docs]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("entity", {
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1 font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Entity
            <ArrowUpDown className="size-3.5 opacity-60" />
          </button>
        ),
        cell: (info) => (
          <span className="font-medium">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("label", {
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1 font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Label
            <ArrowUpDown className="size-3.5 opacity-60" />
          </button>
        ),
        cell: (info) => (
          <span className="rounded border border-ai/25 bg-ai/10 px-1.5 py-0.5 font-mono text-[11px] text-ai">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("documentCount", {
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1 font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Documents
            <ArrowUpDown className="size-3.5 opacity-60" />
          </button>
        ),
        cell: (info) => (
          <span className="font-mono tabular-nums">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("totalMentions", {
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1 font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Mentions
            <ArrowUpDown className="size-3.5 opacity-60" />
          </button>
        ),
        cell: (info) => (
          <span className="font-mono tabular-nums">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("avgConfidence", {
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1 font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Avg confidence
            <ArrowUpDown className="size-3.5 opacity-60" />
          </button>
        ),
        cell: (info) => (
          <span className="font-mono tabular-nums">
            {(info.getValue() * 100).toFixed(0)}%
          </span>
        ),
      }),
      columnHelper.accessor("libraryPercent", {
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1 font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            % library
            <ArrowUpDown className="size-3.5 opacity-60" />
          </button>
        ),
        cell: (info) => (
          <span className="font-mono tabular-nums">
            {info.getValue().toFixed(1)}%
          </span>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = String(filterValue).trim().toLowerCase();
      if (!query) return true;
      const data = row.original;
      return (
        data.entity.toLowerCase().includes(query) ||
        data.label.toLowerCase().includes(query)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleExportCsv = () => {
    const exportRows = table.getSortedRowModel().rows.map((row) => ({
      Entity: row.original.entity,
      Label: row.original.label,
      Documents: row.original.documentCount,
      "Total mentions": row.original.totalMentions,
      "Avg confidence": `${(row.original.avgConfidence * 100).toFixed(1)}%`,
      "% of library": `${row.original.libraryPercent.toFixed(1)}%`,
    }));

    const csv = Papa.unparse(exportRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "afia-entity-stats.csv";
    link.click();
    URL.revokeObjectURL(link.href);
    logAction("export", "analysis");
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-hairline bg-surface px-6 py-10 text-center text-sm text-muted-foreground">
        No entity statistics yet — analyze documents to populate this table.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Filter by entity or label…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <Button size="sm" variant="outline" onClick={handleExportCsv}>
          <Download className="size-4" />
          Export CSV
        </Button>
        <span className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} of {rows.length} entities
        </span>
      </div>

      <div className="rounded-lg border border-hairline">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No entities match your filter.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        cell.column.id === "entity" && "max-w-[220px]",
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
