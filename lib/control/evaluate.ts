import { getRulesForLayer } from "./store";
import type { ControlDecision } from "./types";

export function evaluateControl(layer: string, context: any): ControlDecision {
  const layerRules = getRulesForLayer(layer);
  const triggeredRules: string[] = [];
  let allowed = true;
  let modifiedContext = context;

  for (const rule of layerRules) {
    if (!rule.condition(modifiedContext)) {
      continue;
    }

    triggeredRules.push(rule.id);

    if (rule.action === "block") {
      allowed = false;
      break;
    }

    if (rule.action === "augment" && rule.transform) {
      modifiedContext = rule.transform(modifiedContext);
    }
  }

  return {
    allowed,
    modifiedContext,
    triggeredRules,
  };
}
