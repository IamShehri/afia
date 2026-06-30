import { type LucideIcon, Inbox, AlertOctagon, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick?: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="text-[15px] font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-pretty text-[13px] text-muted-foreground">
        {description}
      </p>
      {action && (
        <Button className="mt-5" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this view. Your session is safe — try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/[0.04] px-6 py-16 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <AlertOctagon className="h-6 w-6" />
      </span>
      <h3 className="text-[15px] font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-pretty text-[13px] text-muted-foreground">
        {description}
      </p>
      {onRetry && (
        <Button variant="outline" className="mt-5 gap-1.5" size="sm" onClick={onRetry}>
          <RotateCw className="h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  );
}

export function TableLoading() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="ml-auto h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
