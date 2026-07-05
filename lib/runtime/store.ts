import type { RuntimeReplaySummary } from "./types";

const executionRecords = new Map<string, RuntimeReplaySummary>();

export function storeExecutionRecord(
  traceId: string,
  record: RuntimeReplaySummary
): void {
  executionRecords.set(traceId, record);
}

export function getExecutionRecord(
  traceId: string
): RuntimeReplaySummary | null {
  return executionRecords.get(traceId) ?? null;
}

export function clearExecutionRecords(): void {
  executionRecords.clear();
}
