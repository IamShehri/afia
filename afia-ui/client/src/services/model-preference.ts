import { getModels } from "@/services/openmed-client";
import {
  isModelCompatibleOnPlatform,
  pickDefaultNerModelId,
} from "@/lib/model-platform";

const STORAGE_KEY = "afia_active_model";

let cachedDefaultModel: string | null = null;
let defaultFetchPromise: Promise<string | null> | null = null;

export function getActiveModel(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    if (!isModelCompatibleOnPlatform(stored)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return stored;
  } catch {
    return null;
  }
}

export function setActiveModel(modelId: string | null): void {
  try {
    if (modelId) {
      if (!isModelCompatibleOnPlatform(modelId)) {
        return;
      }
      localStorage.setItem(STORAGE_KEY, modelId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

async function fetchDefaultAnalysisModel(): Promise<string | null> {
  if (cachedDefaultModel) return cachedDefaultModel;
  if (defaultFetchPromise) return defaultFetchPromise;

  defaultFetchPromise = getModels()
    .then((data) => {
      cachedDefaultModel = pickDefaultNerModelId(data.ner);
      return cachedDefaultModel;
    })
    .catch(() => null)
    .finally(() => {
      defaultFetchPromise = null;
    });

  return defaultFetchPromise;
}

/** Warm the default-model cache after the bridge is reachable. */
export function preloadDefaultAnalysisModel(): void {
  void fetchDefaultAnalysisModel();
}

/**
 * User selection if set, else first non-mlx NER model from the bridge.
 * Throws if no compatible model is available (avoids bridge auto-picking MLX).
 */
export async function resolveAnalysisModel(): Promise<string> {
  const stored = getActiveModel();
  if (stored) return stored;

  const fallback = await fetchDefaultAnalysisModel();
  if (!fallback) {
    throw new Error(
      "No compatible NER model available from the OpenMed bridge. Start the bridge and reload.",
    );
  }
  return fallback;
}
