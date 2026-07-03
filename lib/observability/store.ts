import type { TraceEvent } from "./types";

const traces: TraceEvent[] = [];

export function recordTrace(event: TraceEvent): void {
  traces.push(event);
}

export function getTrace(): TraceEvent[] {
  return traces.slice().sort((a, b) => a.timestamp - b.timestamp);
}

export function clearTrace(): void {
  traces.length = 0;
}

export function getEntityTrace(entityId: string): TraceEvent[] {
  const matches: TraceEvent[] = [];

  for (const trace of traces) {
    if (trace.entityId === entityId) {
      matches.push(trace);
      continue;
    }

    if (!trace.meta) {
      continue;
    }

    let related = false;
    for (const key of Object.keys(trace.meta)) {
      if (trace.meta[key] === entityId) {
        related = true;
        break;
      }
    }

    if (related) {
      matches.push(trace);
    }
  }

  return matches.slice().sort((a, b) => a.timestamp - b.timestamp);
}
