import type { DocumentEntity } from "@/lib/documents";

/** Slim in-memory shape — avoids caching full PDF text. */
export interface AnalyzedDocSummary {
  id: string;
  filename: string;
  entities: DocumentEntity[];
  lastAccessedAt: number;
  pageCount: number;
  wordCount: number;
  modelUsed?: string;
  analyzedAt: number;
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

export interface CooccurrenceEntity {
  id: string;
  label: string;
  type: string;
  docFrequency: number;
}

export interface CooccurrenceMatrix {
  entities: CooccurrenceEntity[];
  /** Symmetric values — diagonal holds document frequency. */
  values: number[][];
  /** Document ids for off-diagonal pair, keyed by normalized `a|b`. */
  pairDocIds: Record<string, string[]>;
}

export interface EntityStatRow {
  id: string;
  entity: string;
  label: string;
  documentCount: number;
  totalMentions: number;
  avgConfidence: number;
  /** Share of analyzed library documents containing this entity (0–100). */
  libraryPercent: number;
}

interface EntityAggregate {
  id: string;
  label: string;
  typeCounts: Map<string, number>;
  docIds: Set<string>;
  mentionCount: number;
  confidenceSum: number;
}

function buildEntityAggregates(
  docs: AnalyzedDocSummary[],
): Map<string, EntityAggregate> {
  const aggregates = new Map<string, EntityAggregate>();

  for (const doc of docs) {
    const seenInDoc = new Set<string>();
    for (const entity of doc.entities) {
      const text = entity.text.trim();
      if (!text) continue;
      const id = normalizeText(text);
      let agg = aggregates.get(id);
      if (!agg) {
        agg = {
          id,
          label: text,
          typeCounts: new Map([[entity.label, 1]]),
          docIds: new Set<string>(),
          mentionCount: 0,
          confidenceSum: 0,
        };
        aggregates.set(id, agg);
      } else {
        agg.typeCounts.set(
          entity.label,
          (agg.typeCounts.get(entity.label) ?? 0) + 1,
        );
        if (text.length > agg.label.length) {
          agg.label = text;
        }
      }
      agg.mentionCount += 1;
      agg.confidenceSum += entity.confidence ?? 0;
      seenInDoc.add(id);
    }
    for (const id of seenInDoc) {
      aggregates.get(id)?.docIds.add(doc.id);
    }
  }

  return aggregates;
}

function dominantLabel(typeCounts: Map<string, number>): string {
  let label = "UNKNOWN";
  let max = 0;
  for (const [type, count] of typeCounts) {
    if (count > max) {
      label = type;
      max = count;
    }
  }
  return label;
}

function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function computeCooccurrenceMatrix(
  docs: AnalyzedDocSummary[],
  topN = 12,
): CooccurrenceMatrix | null {
  if (docs.length < 2) return null;

  const aggregates = buildEntityAggregates(docs);
  const ranked = [...aggregates.values()]
    .sort((a, b) => b.docIds.size - a.docIds.size)
    .slice(0, topN);

  if (ranked.length < 2) return null;

  const entities: CooccurrenceEntity[] = ranked.map((agg) => ({
    id: agg.id,
    label: agg.label,
    type: dominantLabel(agg.typeCounts),
    docFrequency: agg.docIds.size,
  }));

  const indexById = new Map(entities.map((entity, index) => [entity.id, index]));
  const size = entities.length;
  const values = Array.from({ length: size }, () => Array(size).fill(0));
  const pairDocIds: Record<string, string[]> = {};

  for (let i = 0; i < size; i += 1) {
    values[i]![i] = entities[i]!.docFrequency;
  }

  for (const doc of docs) {
    const keys = [
      ...new Set(
        doc.entities
          .map((entity) => normalizeText(entity.text.trim()))
          .filter((key) => indexById.has(key)),
      ),
    ];

    for (let i = 0; i < keys.length; i += 1) {
      for (let j = i + 1; j < keys.length; j += 1) {
        const a = keys[i]!;
        const b = keys[j]!;
        const row = indexById.get(a)!;
        const col = indexById.get(b)!;
        values[row]![col] += 1;
        values[col]![row] += 1;

        const key = pairKey(a, b);
        if (!pairDocIds[key]) pairDocIds[key] = [];
        pairDocIds[key].push(doc.id);
      }
    }
  }

  return { entities, values, pairDocIds };
}

export function computeEntityStatistics(
  docs: AnalyzedDocSummary[],
): EntityStatRow[] {
  if (docs.length === 0) return [];

  const aggregates = buildEntityAggregates(docs);
  const librarySize = docs.length;

  return [...aggregates.values()]
    .map((agg) => ({
      id: agg.id,
      entity: agg.label,
      label: dominantLabel(agg.typeCounts),
      documentCount: agg.docIds.size,
      totalMentions: agg.mentionCount,
      avgConfidence:
        agg.mentionCount > 0 ? agg.confidenceSum / agg.mentionCount : 0,
      libraryPercent: (agg.docIds.size / librarySize) * 100,
    }))
    .sort((a, b) => b.documentCount - a.documentCount);
}

export function getCooccurrencePairDocs(
  matrix: CooccurrenceMatrix,
  row: number,
  col: number,
): string[] {
  if (row === col) return [];
  const a = matrix.entities[row]?.id;
  const b = matrix.entities[col]?.id;
  if (!a || !b) return [];
  return matrix.pairDocIds[pairKey(a, b)] ?? [];
}

export interface CooccurrenceLongRow {
  entity_a: string;
  entity_b: string;
  count: number;
}

/** All entity pair co-occurrences across the library (long/tidy format). */
export function computeCooccurrenceLong(
  docs: AnalyzedDocSummary[],
): CooccurrenceLongRow[] {
  if (docs.length === 0) return [];

  const aggregates = buildEntityAggregates(docs);
  const idToLabel = new Map<string, string>();
  for (const agg of aggregates.values()) {
    idToLabel.set(agg.id, agg.label);
  }

  const pairCounts = new Map<string, number>();
  for (const doc of docs) {
    const keys = [
      ...new Set(
        doc.entities
          .map((entity) => normalizeText(entity.text.trim()))
          .filter(Boolean),
      ),
    ];
    for (let i = 0; i < keys.length; i += 1) {
      for (let j = i + 1; j < keys.length; j += 1) {
        const key = pairKey(keys[i]!, keys[j]!);
        pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
      }
    }
  }

  return [...pairCounts.entries()]
    .map(([key, count]) => {
      const [a, b] = key.split("|") as [string, string];
      return {
        entity_a: idToLabel.get(a) ?? a,
        entity_b: idToLabel.get(b) ?? b,
        count,
      };
    })
    .sort((left, right) => right.count - left.count);
}
