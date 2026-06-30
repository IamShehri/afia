import { useState } from "react";
import { Plus, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/workspace/page-header";
import { EmptyState, ErrorState } from "@/components/workspace/states";
import { Button } from "@/components/ui/button";

interface ModulePlaceholderProps {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  actionLabel: string;
  icon?: LucideIcon;
}

export function ModulePlaceholder({
  title,
  description,
  emptyTitle,
  emptyDescription,
  actionLabel,
  icon,
}: ModulePlaceholderProps) {
  const [errored, setErrored] = useState(false);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 p-5 lg:p-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setErrored((v) => !v)}
            >
              {errored ? "Reset" : "Simulate error"}
            </Button>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              {actionLabel}
            </Button>
          </>
        }
      />
      {errored ? (
        <ErrorState onRetry={() => setErrored(false)} />
      ) : (
        <EmptyState
          icon={icon}
          title={emptyTitle}
          description={emptyDescription}
          action={{ label: actionLabel }}
        />
      )}
    </div>
  );
}
