import { useEffect, useState } from "react";
import { Plus, Download } from "lucide-react";
import { PageHeader } from "@/components/workspace/page-header";
import { PatientTable } from "@/components/workspace/patient-table";
import { TableLoading } from "@/components/workspace/states";
import { Button } from "@/components/ui/button";

export function PatientsPage() {
  const [loading, setLoading] = useState(true);

  // Simulate an initial fetch to showcase the loading state.
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 p-5 lg:p-6">
      <PageHeader
        title="Patients"
        description="Every patient across your assigned units, in one fast, filterable view."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Admit patient
            </Button>
          </>
        }
      />
      {loading ? <TableLoading /> : <PatientTable />}
    </div>
  );
}
