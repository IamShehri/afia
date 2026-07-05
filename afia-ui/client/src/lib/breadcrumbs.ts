export interface Breadcrumb {
  label: string;
  href?: string;
}

const STUDIO_CRUMBS: Record<string, string> = {
  "/documents": "Document",
  "/batch": "Batch Process",
  "/deidentify": "De-identify",
  "/compare": "Model Compare",
  "/models": "Model Library",
};

const LAB_TAB_CRUMBS: Record<string, string> = {
  overview: "Overview",
  graph: "Entity Graph",
  workbench: "Workbench",
};

/** Returns null when no breadcrumb strip should render. */
export function buildBreadcrumbs(
  pathname: string,
  search: string,
): Breadcrumb[] | null {
  if (pathname.startsWith("/analytics")) {
    if (pathname === "/analytics/report") {
      return [{ label: "Lab" }, { label: "Report" }];
    }
    const tab =
      new URLSearchParams(
        search.startsWith("?") ? search.slice(1) : search,
      ).get("tab") ?? "overview";
    const leaf = LAB_TAB_CRUMBS[tab] ?? "Overview";
    return [
      { label: "Lab", href: "/analytics?tab=overview" },
      { label: leaf },
    ];
  }

  const studioLeaf = STUDIO_CRUMBS[pathname];
  if (studioLeaf) {
    return [{ label: "Studio" }, { label: studioLeaf }];
  }

  if (pathname.startsWith("/workspace/")) {
    return [
      { label: "Workspace", href: "/settings/workspace" },
      { label: "Team" },
    ];
  }

  return null;
}
