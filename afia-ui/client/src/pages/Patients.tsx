import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table";
import { patients } from "@/data/patients";
import type { Patient } from "@/data/types";
import { Monogram, RiskBadge, StatusChip, PageHeader } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, ChevronDown, Eye } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const columnHelper = createColumnHelper<Patient>();

export default function Patients() {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "riskScore", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const { openInspector, pushRecent } = useWorkspace();
  const [, setLocation] = useLocation();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => {
          const isAllSelected = table.getIsAllRowsSelected();
          const isSomeSelected = table.getIsSomeRowsSelected();
          return (
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(input) => {
                if (input) {
                  input.indeterminate = isSomeSelected && !isAllSelected;
                }
              }}
              onChange={table.getToggleAllRowsSelectedHandler()}
              aria-label="Select all"
              className="size-4"
            />
          );
        },
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label="Select row"
            className="size-4"
          />
        ),
        size: 40,
      }),
      columnHelper.display({
        id: "patient",
        header: "Patient",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Monogram name={row.original.name} size={28} />
            <div className="min-w-0">
              <div className="font-medium truncate">{row.original.name}</div>
              <div className="font-mono text-xs text-muted-foreground">
                {row.original.id}
              </div>
            </div>
          </div>
        ),
        size: 220,
      }),
      columnHelper.accessor("age", {
        header: "Age",
        cell: (info) => <span className="font-mono">{info.getValue()}</span>,
        size: 60,
      }),
      columnHelper.accessor("condition", {
        header: "Condition",
        cell: (info) => <span className="text-sm">{info.getValue()}</span>,
        size: 160,
      }),
      columnHelper.accessor("risk", {
        header: "Risk",
        cell: (info) => <RiskBadge risk={info.getValue()} />,
        size: 100,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusChip status={info.getValue()} />,
        size: 110,
      }),
      columnHelper.accessor("riskScore", {
        header: ({ column }) => (
          <button
            onClick={() => {
              const isSorted = column.getIsSorted();
              column.toggleSorting(isSorted === 'desc' ? false : true);
            }}
            className="flex items-center gap-1 hover:text-foreground"
          >
            Score
            <ArrowUpDown className="size-3.5" />
          </button>
        ),
        cell: (info) => (
          <span className="font-mono font-semibold">{info.getValue()}</span>
        ),
        size: 70,
      }),
      columnHelper.accessor("location", {
        header: "Location",
        cell: (info) => <span className="text-sm">{info.getValue()}</span>,
        size: 130,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: patients,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-hairline px-6 py-4">
        <PageHeader title="Patients" />
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search by name, ID, condition…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="size-4" />
                Columns
                <ChevronDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table.getAllLeafColumns().map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) =>
                    column.toggleVisibility(!!value)
                  }
                  className="capitalize"
                >
                  {column.columnDef.header?.toString()}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedCount > 0 && (
        <div className="border-b border-hairline bg-surface px-6 py-2 flex items-center gap-3 text-sm">
          <span className="font-medium">{selectedCount} selected</span>
          <div className="flex-1" />
          <Button variant="ghost" size="sm">
            Assign to team
          </Button>
          <Button variant="ghost" size="sm">
            Flag for review
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRowSelection({})}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-surface border-b border-hairline">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => {
                  pushRecent(row.original.id);
                  openInspector(row.original.id);
                  setLocation(`/patients/${row.original.id}`);
                }}
                className={cn(
                  "border-b border-hairline hover:bg-surface transition-colors cursor-pointer",
                  row.getIsSelected() && "bg-surface",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 text-sm"
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-hairline bg-surface px-6 py-3 text-xs text-muted-foreground flex items-center justify-between">
        <span>
          {table.getRowModel().rows.length} of {patients.length} patients
        </span>
        <span>Showing {table.getRowModel().rows.length} results</span>
      </div>
    </div>
  );
}
