import {
  createDocument,
  getDocument,
  updateDocument,
  LIBRARY_GRAPH_ARTIFACT_ID,
  LIBRARY_GRAPH_ARTIFACT_TITLE,
  type LibraryGraphSpec,
} from "@/lib/documents";

export async function loadLibraryGraphArtifact(): Promise<LibraryGraphSpec | null> {
  const doc = await getDocument(LIBRARY_GRAPH_ARTIFACT_ID);
  return doc?.metadata?.graph_spec ?? null;
}

export async function saveLibraryGraphArtifact(
  spec: LibraryGraphSpec,
): Promise<void> {
  const existing = await getDocument(LIBRARY_GRAPH_ARTIFACT_ID);
  const metadata = {
    ...(existing?.metadata ?? {}),
    graph_spec: spec,
    last_accessed_at: Date.now(),
  };

  if (existing) {
    await updateDocument(LIBRARY_GRAPH_ARTIFACT_ID, { metadata });
    return;
  }

  await createDocument(LIBRARY_GRAPH_ARTIFACT_TITLE, "{}", {
    bridgeDocumentId: LIBRARY_GRAPH_ARTIFACT_ID,
    status: "artifact",
    metadata,
  });
}
