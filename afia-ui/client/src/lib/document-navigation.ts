/** Build Document Studio URL with digest + resolver hints for shared workspaces. */
export function documentStudioHref(
  doc: { id: string; rowId?: string },
  activeWorkspaceId?: string | null,
): string {
  const params = new URLSearchParams({ doc: doc.id });
  if (doc.rowId) {
    params.set("row_id", doc.rowId);
  }
  if (activeWorkspaceId !== undefined) {
    params.set(
      "workspace_id",
      activeWorkspaceId === null ? "personal" : activeWorkspaceId,
    );
  }
  return `/documents?${params.toString()}`;
}

export function parseDocumentStudioSearch(search: string): {
  docId: string | null;
  rowId: string | null;
  workspaceHint: string | null | undefined;
} {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  const docId = params.get("doc");
  const rowId = params.get("row_id");
  const workspaceParam = params.get("workspace_id");
  let workspaceHint: string | null | undefined;
  if (workspaceParam === "personal") {
    workspaceHint = null;
  } else if (workspaceParam) {
    workspaceHint = workspaceParam;
  } else {
    workspaceHint = undefined;
  }
  return { docId, rowId, workspaceHint };
}
