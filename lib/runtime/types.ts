export type RuntimeRequestType =
  | "patient_flow"
  | "query"
  | "reasoning"
  | "mutation";

export type RuntimeContext = {
  patientId: string;
  episodeId?: string;
  encounterId?: string;
  requestType: RuntimeRequestType;
  timestamp: number;
  metadata?: Record<string, any>;
};

export type RuntimeExecutionResult = {
  traceId: string;
  requestType: RuntimeRequestType;
  patientId: string;
  domain?: Record<string, any>;
  query?: Record<string, any>;
  reasoning?: Record<string, any>;
};

export type SafeRuntimeResult = {
  result?: RuntimeExecutionResult;
  error?: string;
};

export type RuntimeReplaySummary = {
  traceId: string;
  controlDecisions: Array<{
    layer: string;
    allowed: boolean;
    triggeredRules: string[];
  }>;
  queryOutputs: Record<string, any>;
  reasoningOutputs: Record<string, any>;
  traces: Array<{
    timestamp: number;
    layer: string;
    action: string;
    entityId?: string;
  }>;
};
