import type { ControlRule } from "./types";

const rules: ControlRule[] = [];

export function registerControlRule(rule: ControlRule): void {
  rules.push(rule);
}

export function getControlRules(): ControlRule[] {
  return rules.slice();
}

export function clearControlRules(): void {
  rules.length = 0;
}

export function getRulesForLayer(layer: string): ControlRule[] {
  const layerRules: ControlRule[] = [];

  for (const rule of rules) {
    if (rule.layer === layer) {
      layerRules.push(rule);
    }
  }

  return layerRules.sort((a, b) => b.priority - a.priority);
}
