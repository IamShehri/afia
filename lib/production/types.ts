export type SystemBlueprint = {
  version: string;
  layers: string[];
  modules: Record<string, string>;
  executionFlow: string[];
  dataFlow: string[];
  controlFlow: string[];
};

export type ArchitectureValidation = {
  valid: boolean;
  issues: string[];
};

export type ExecutionTopologyNode = {
  step: number;
  layer: string;
  component: string;
  action: string;
  intercepts?: string[];
  observes?: string[];
};

export type ExecutionTopology = {
  entry: string;
  flow: ExecutionTopologyNode[];
  exit: string;
};
