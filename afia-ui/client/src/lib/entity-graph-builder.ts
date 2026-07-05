import type { AnalyzedDocSummary } from "@/lib/analytics-library";
import type {
  GraphConnection,
  GraphElement,
  LibraryGraphSpec,
} from "@/lib/documents";

export interface EntityNodeMeta {
  id: string;
  label: string;
  type: string;
  docFrequency: number;
  docIds: string[];
}

function entityKey(text: string): string {
  return text.trim().toLowerCase();
}

/** Build graph spec from analyzed library — layout fields come from saved overlay. */
export function buildGraphFromLibrary(
  docs: AnalyzedDocSummary[],
): LibraryGraphSpec {
  const nodeMap = new Map<
    string,
    {
      label: string;
      type: string;
      typeCounts: Map<string, number>;
      docIds: Set<string>;
    }
  >();

  for (const doc of docs) {
    const seenInDoc = new Set<string>();
    for (const entity of doc.entities) {
      const key = entityKey(entity.text);
      if (!key) continue;

      let node = nodeMap.get(key);
      if (!node) {
        node = {
          label: entity.text.trim(),
          type: entity.label,
          typeCounts: new Map([[entity.label, 1]]),
          docIds: new Set([doc.id]),
        };
        nodeMap.set(key, node);
      } else {
        node.docIds.add(doc.id);
        node.typeCounts.set(
          entity.label,
          (node.typeCounts.get(entity.label) ?? 0) + 1,
        );
        if (entity.text.trim().length > node.label.length) {
          node.label = entity.text.trim();
        }
      }
      seenInDoc.add(key);
    }
  }

  const edgeWeights = new Map<string, number>();
  for (const doc of docs) {
    const keys = [
      ...new Set(
        doc.entities
          .map((e) => entityKey(e.text))
          .filter(Boolean),
      ),
    ];
    for (let i = 0; i < keys.length; i += 1) {
      for (let j = i + 1; j < keys.length; j += 1) {
        const a = keys[i]!;
        const b = keys[j]!;
        const edgeKey = a < b ? `${a}|${b}` : `${b}|${a}`;
        edgeWeights.set(edgeKey, (edgeWeights.get(edgeKey) ?? 0) + 1);
      }
    }
  }

  const elements: GraphElement[] = [...nodeMap.entries()]
    .sort((a, b) => b[1].docIds.size - a[1].docIds.size)
    .map(([id, node]) => {
      let topType = node.type;
      let topCount = 0;
      for (const [label, count] of node.typeCounts) {
        if (count > topCount) {
          topType = label;
          topCount = count;
        }
      }
      return {
        id,
        label: node.label,
        type: topType,
      };
    });

  const connections: GraphConnection[] = [...edgeWeights.entries()].map(
    ([key, weight]) => {
      const [from, to] = key.split("|") as [string, string];
      return { from, to, weight };
    },
  );

  return { elements, connections };
}

export function mergeGraphWithSavedLayout(
  built: LibraryGraphSpec,
  saved: LibraryGraphSpec | null,
): LibraryGraphSpec {
  if (!saved) return built;

  const savedById = new Map(saved.elements.map((el) => [el.id, el]));
  const elements = built.elements.map((el) => {
    const overlay = savedById.get(el.id);
    if (!overlay) return el;
    return {
      ...el,
      pinned: overlay.pinned,
      x: overlay.x,
      y: overlay.y,
      hidden: overlay.hidden,
    };
  });

  return {
    elements,
    connections: built.connections,
  };
}

export function buildEntityNodeMeta(
  docs: AnalyzedDocSummary[],
): Map<string, EntityNodeMeta> {
  const meta = new Map<string, EntityNodeMeta>();

  for (const doc of docs) {
    const seen = new Set<string>();
    for (const entity of doc.entities) {
      const id = entityKey(entity.text);
      if (!id || seen.has(id)) continue;
      seen.add(id);

      const existing = meta.get(id);
      if (!existing) {
        meta.set(id, {
          id,
          label: entity.text.trim(),
          type: entity.label,
          docFrequency: 1,
          docIds: [doc.id],
        });
      } else {
        existing.docFrequency += 1;
        existing.docIds.push(doc.id);
        if (entity.text.trim().length > existing.label.length) {
          existing.label = entity.text.trim();
        }
      }
    }
  }

  return meta;
}

export function parseGraphSpecJson(raw: string): LibraryGraphSpec {
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Graph spec must be a JSON object");
  }

  const obj = parsed as Record<string, unknown>;
  if (!Array.isArray(obj.elements) || !Array.isArray(obj.connections)) {
    throw new Error('Graph spec requires "elements" and "connections" arrays');
  }

  const elements: GraphElement[] = obj.elements.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`elements[${index}] must be an object`);
    }
    const el = item as Record<string, unknown>;
    if (typeof el.id !== "string" || typeof el.label !== "string") {
      throw new Error(`elements[${index}] requires string id and label`);
    }
    return {
      id: el.id,
      label: el.label,
      type: typeof el.type === "string" ? el.type : "UNKNOWN",
      pinned: el.pinned === true,
      hidden: el.hidden === true,
      x: typeof el.x === "number" ? el.x : undefined,
      y: typeof el.y === "number" ? el.y : undefined,
    };
  });

  const connections: GraphConnection[] = obj.connections.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`connections[${index}] must be an object`);
    }
    const conn = item as Record<string, unknown>;
    if (
      typeof conn.from !== "string" ||
      typeof conn.to !== "string" ||
      typeof conn.weight !== "number"
    ) {
      throw new Error(
        `connections[${index}] requires string from/to and numeric weight`,
      );
    }
    return {
      from: conn.from,
      to: conn.to,
      weight: conn.weight,
    };
  });

  return { elements, connections };
}

export function serializeGraphSpec(spec: LibraryGraphSpec): string {
  return JSON.stringify(spec, null, 2);
}

export function countVisibleNodes(spec: LibraryGraphSpec): number {
  return spec.elements.filter((el) => !el.hidden).length;
}

export function specsEqual(a: LibraryGraphSpec, b: LibraryGraphSpec): boolean {
  return serializeGraphSpec(a) === serializeGraphSpec(b);
}

export function updateElementInSpec(
  spec: LibraryGraphSpec,
  id: string,
  patch: Partial<GraphElement>,
): LibraryGraphSpec {
  return {
    ...spec,
    elements: spec.elements.map((el) =>
      el.id === id ? { ...el, ...patch } : el,
    ),
  };
}

export function hideElementInSpec(
  spec: LibraryGraphSpec,
  id: string,
): LibraryGraphSpec {
  return updateElementInSpec(spec, id, { hidden: true });
}
