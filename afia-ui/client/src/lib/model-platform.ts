export function isMacOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    /Mac/i.test(navigator.platform)
  );
}

/** MLX-packaged models end with "-mlx" and require Apple Silicon. */
export function isMlxModel(modelId: string): boolean {
  return /-mlx$/i.test(modelId.trim());
}

export function isModelCompatibleOnPlatform(modelId: string): boolean {
  if (!isMlxModel(modelId)) return true;
  return isMacOS();
}

export function filterCompatibleModelIds(modelIds: string[]): string[] {
  return modelIds.filter(isModelCompatibleOnPlatform);
}

export interface ModelLike {
  id: string;
  name?: string;
}

export function filterCompatibleModels<T extends ModelLike>(models: T[]): T[] {
  return models.filter((m) => isModelCompatibleOnPlatform(m.id));
}

export function partitionModelsByCompatibility<T extends ModelLike>(
  models: T[],
): { compatible: T[]; incompatible: T[] } {
  const compatible: T[] = [];
  const incompatible: T[] = [];
  for (const m of models) {
    if (isModelCompatibleOnPlatform(m.id)) {
      compatible.push(m);
    } else {
      incompatible.push(m);
    }
  }
  return { compatible, incompatible };
}

/** First platform-compatible NER model from the bridge catalog. */
export function pickDefaultNerModelId(models: ModelLike[]): string | null {
  const compatible = filterCompatibleModels(models);
  return compatible[0]?.id ?? null;
}
