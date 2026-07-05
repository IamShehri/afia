import { useLocation } from "wouter";
import { buildBreadcrumbs } from "@/lib/breadcrumbs";
import { ChevronRight } from "lucide-react";

export function BreadcrumbBar() {
  const [location, setLocation] = useLocation();
  const pathname = location.split("?")[0] ?? location;
  const search = location.includes("?") ? location.slice(location.indexOf("?")) : "";
  const crumbs = buildBreadcrumbs(pathname, search);

  if (!crumbs || crumbs.length === 0) {
    return null;
  }

  return (
    <div className="flex h-8 shrink-0 items-center border-b border-hairline bg-surface/60 px-4">
      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground"
      >
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="size-3 shrink-0 opacity-50" aria-hidden />
              )}
              {crumb.href && !isLast ? (
                <button
                  type="button"
                  onClick={() => setLocation(crumb.href!)}
                  className="truncate font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {crumb.label}
                </button>
              ) : (
                <span
                  className={
                    isLast
                      ? "truncate font-medium text-foreground"
                      : "truncate font-medium"
                  }
                  aria-current={isLast ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
