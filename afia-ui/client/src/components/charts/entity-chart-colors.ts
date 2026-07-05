/** Stable label colors — chart-2 matches the primary entity badge (ai) tone. */
const ENTITY_LABEL_PALETTE = [
  "var(--color-chart-2)",
  "var(--color-chart-1)",
  "var(--color-chart-3)",
  "var(--color-chart-5)",
  "var(--color-chart-4)",
] as const;

export function buildEntityLabelColorMap(labels: string[]): Map<string, string> {
  const sorted = [...labels].sort((a, b) => a.localeCompare(b));
  const map = new Map<string, string>();
  sorted.forEach((label, index) => {
    map.set(label, ENTITY_LABEL_PALETTE[index % ENTITY_LABEL_PALETTE.length]);
  });
  return map;
}

export function getEntityLabelColor(
  label: string,
  colorMap: Map<string, string>,
): string {
  return colorMap.get(label) ?? ENTITY_LABEL_PALETTE[0];
}
