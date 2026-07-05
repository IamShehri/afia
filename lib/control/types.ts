export type ControlLayer =
  | "patient"
  | "event"
  | "encounter"
  | "episode"
  | "query"
  | "reasoning";

export type ControlAction = "allow" | "block" | "augment";

export type ControlRule = {
  id: string;
  layer: ControlLayer;
  condition: (context: any) => boolean;
  action: ControlAction;
  priority: number;
  transform?: (context: any) => any;
};

export type ControlDecision = {
  allowed: boolean;
  modifiedContext?: any;
  triggeredRules: string[];
};
