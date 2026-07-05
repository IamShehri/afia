import type { DocumentEntity } from "@/lib/documents";

/** Slim in-memory shape — avoids caching full PDF text. */
export interface AnalyzedDocSummary {
  id: string;
  filename: string;
  entities: DocumentEntity[];
  lastAccessedAt: number;
}

export const LIBRARY_ANALYTICS_CAP = 50;

export interface LibraryOverview {
  documentCount: number;
  totalEntities: number;
  avgConfidence: number;
  topLabel: string | null;
}

export interface TopEntityRow {
  text: string;
  label: string;
  count: number;
}

export interface DocumentConfidenceRow {
  id: string;
  filename: string;
  avgConfidence: number;
}

export interface ComparisonEntity {
  text: string;
  label: string;
}

export interface DocumentComparisonResult {
  shared: ComparisonEntity[];
  onlyA: ComparisonEntity[];
  onlyB: ComparisonEntity[];
}

function normalizeText(text: string): string {
  return text.trim().toLowerCase();
}

export function computeLibraryOverview(
  docs: AnalyzedDocSummary[],
): LibraryOverview {
  if (docs.length === 0) {
    return {
      documentCount: 0,
      totalEntities: 0,
      avgConfidence: 0,
      topLabel: null,
    };
  }

  let totalEntities = 0;
  let confidenceSum = 0;
  const labelCounts = new Map<string, number>();

  for (const doc of docs) {
    totalEntities += doc.entities.length;
    for (const entity of doc.entities) {
      confidenceSum += entity.confidence ?? 0;
      labelCounts.set(entity.label, (labelCounts.get(entity.label) ?? 0) + 1);
    }
  }

  let topLabel: string | null = null;
  let topLabelCount = 0;
  for (const [label, count] of labelCounts) {
    if (count > topLabelCount) {
      topLabel = label;
      topLabelCount = count;
    }
  }

  return {
    documentCount: docs.length,
    totalEntities,
    avgConfidence:
      totalEntities > 0 ? confidenceSum / totalEntities : 0,
    topLabel,
  };
}

export function computeTopEntities(
  docs: AnalyzedDocSummary[],
  limit = 15,
): TopEntityRow[] {
  const groups = new Map<
    string,
    { text: string; labelCounts: Map<string, number>; count: number }
  >();

  for (const doc of docs) {
    for (const entity of doc.entities) {
      const text = entity.text.trim();
      if (!text) continue;
      const key = normalizeText(text);
      const existing = groups.get(key);
      if (existing) {
        existing.count += 1;
        existing.labelCounts.set(
          entity.label,
          (existing.labelCounts.get(entity.label) ?? 0) + 1,
        );
      } else {
        groups.set(key, {
          text,
          count: 1,
          labelCounts: new Map([[entity.label, 1]]),
        });
      }
    }
  }

  const rows: TopEntityRow[] = [];
  for (const group of groups.values()) {
    let label = "";
    let max = 0;
    for (const [l, c] of group.labelCounts) {
      if (c > max) {
        label = l;
        max = c;
      }
    }
    rows.push({ text: group.text, label, count: group.count });
  }

  return rows.sort((a, b) => b.count - a.count).slice(0, limit);
}

export function computeConfidenceByDocument(
  docs: AnalyzedDocSummary[],
): DocumentConfidenceRow[] {
  return docs
    .map((doc) => {
      const avg =
        doc.entities.reduce((sum, e) => sum + (e.confidence ?? 0), 0) /
        doc.entities.length;
      return {
        id: doc.id,
        filename: doc.filename,
        avgConfidence: avg,
      };
    })
    .sort((a, b) => a.avgConfidence - b.avgConfidence);
}

function entitiesByNormalizedText(
  entities: DocumentEntity[],
): Map<string, ComparisonEntity> {
  const map = new Map<string, ComparisonEntity>();
  for (const entity of entities) {
    const text = entity.text.trim();
    if (!text) continue;
    const key = normalizeText(text);
    if (!map.has(key)) {
      map.set(key, { text, label: entity.label });
    }
  }
  return map;
}

export function compareDocuments(
  docA: AnalyzedDocSummary,
  docB: AnalyzedDocSummary,
): DocumentComparisonResult {
  const mapA = entitiesByNormalizedText(docA.entities);
  const mapB = entitiesByNormalizedText(docB.entities);

  const shared: ComparisonEntity[] = [];
  const onlyA: ComparisonEntity[] = [];
  const onlyB: ComparisonEntity[] = [];

  for (const [key, value] of mapA) {
    if (mapB.has(key)) {
      shared.push(value);
    } else {
      onlyA.push(value);
    }
  }

  for (const [key, value] of mapB) {
    if (!mapA.has(key)) {
      onlyB.push(value);
    }
  }

  const byText = (a: ComparisonEntity, b: ComparisonEntity) =>
    a.text.localeCompare(b.text);

  return {
    shared: shared.sort(byText),
    onlyA: onlyA.sort(byText),
    onlyB: onlyB.sort(byText),
  };
}
