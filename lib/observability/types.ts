export type TraceLayer =
  | "patient"
  | "event"
  | "encounter"
  | "episode"
  | "query"
  | "reasoning";

export type TraceEvent = {
  timestamp: number;
  layer: TraceLayer;
  action: string;
  entityId?: string;
  meta?: Record<string, any>;
};
