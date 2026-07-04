const STORAGE_KEY = "afia_active_model";

export function getActiveModel(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setActiveModel(modelId: string | null): void {
  try {
    if (modelId) {
      localStorage.setItem(STORAGE_KEY, modelId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}
