import { filterUserDocuments, getDocument, listDocuments } from "@/lib/documents";
import {
  LIBRARY_ANALYTICS_CAP,
  type AnalyzedDocSummary,
} from "@/lib/analytics-library";

const FETCH_CONCURRENCY = 4;

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export interface LibraryLoadResult {
  analyzed: AnalyzedDocSummary[];
  skippedUnanalyzed: number;
  truncated: boolean;
  totalInLibrary: number;
  scannedCount: number;
}

export async function loadLibrarySummaries(
  callbacks: {
    onProgress: (loaded: number, total: number) => void;
    onPartial?: (partial: {
      analyzed: AnalyzedDocSummary[];
      skippedUnanalyzed: number;
    }) => void;
  },
): Promise<LibraryLoadResult> {
  const index = filterUserDocuments(await listDocuments());
  const totalInLibrary = index.length;
  const truncated = totalInLibrary > LIBRARY_ANALYTICS_CAP;
  const scanBatch = index.slice(0, LIBRARY_ANALYTICS_CAP);

  let skippedUnanalyzed = 0;
  const analyzed: AnalyzedDocSummary[] = [];
  let loaded = 0;

  callbacks.onProgress(0, scanBatch.length);

  for (let i = 0; i < scanBatch.length; i += FETCH_CONCURRENCY) {
    const chunk = scanBatch.slice(i, i + FETCH_CONCURRENCY);
    await Promise.all(
      chunk.map(async (item) => {
        try {
          const full = await getDocument(item.id);
          if (!full || full.entities.length === 0) {
            skippedUnanalyzed += 1;
            return;
          }
          analyzed.push({
            id: full.id,
            filename: full.filename,
            entities: full.entities,
            lastAccessedAt: full.lastAccessedAt,
            pageCount: full.page_count,
            wordCount: countWords(full.full_text),
            modelUsed: full.modelUsed,
            analyzedAt: full.uploadedAt ?? full.lastAccessedAt,
          });
        } catch {
          skippedUnanalyzed += 1;
        } finally {
          loaded += 1;
          callbacks.onProgress(loaded, scanBatch.length);
          callbacks.onPartial?.({
            analyzed: [...analyzed],
            skippedUnanalyzed,
          });
        }
      }),
    );
  }

  return {
    analyzed,
    skippedUnanalyzed,
    truncated,
    totalInLibrary,
    scannedCount: scanBatch.length,
  };
}
