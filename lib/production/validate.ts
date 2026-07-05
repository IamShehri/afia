import { generateSystemBlueprint } from "./blueprint";
import type { ArchitectureValidation } from "./types";

const REQUIRED_LAYERS = [
  "control",
  "observability",
  "domain",
  "query",
  "reasoning",
  "fault-validation",
];

const REQUIRED_MODULES = [
  "domain.patient",
  "domain.episode",
  "domain.encounter",
  "domain.event",
  "domain.timeline",
  "query",
  "reasoning",
  "observability",
  "control",
  "fault-validation",
];

const LAYER_DEPENDENCIES: Record<string, string[]> = {
  control: ["domain", "query", "reasoning"],
  observability: ["domain", "query", "reasoning"],
  domain: [],
  query: ["domain"],
  reasoning: ["query"],
  "fault-validation": ["domain", "query", "reasoning"],
};

export function validateArchitectureConsistency(): ArchitectureValidation {
  const blueprint = generateSystemBlueprint();
  const issues: string[] = [];

  for (const layer of REQUIRED_LAYERS) {
    if (!blueprint.layers.includes(layer)) {
      issues.push(`Missing required layer: ${layer}`);
    }
  }

  for (const moduleKey of REQUIRED_MODULES) {
    if (!blueprint.modules[moduleKey]) {
      issues.push(`Missing required module mapping: ${moduleKey}`);
    }
  }

  for (const layer of Object.keys(LAYER_DEPENDENCIES)) {
    const dependencies = LAYER_DEPENDENCIES[layer];
    for (const dependency of dependencies) {
      if (!blueprint.layers.includes(dependency)) {
        issues.push(`Layer ${layer} depends on missing layer: ${dependency}`);
      }
    }
  }

  if (!blueprint.controlFlow.some((step) => step.includes("control.evaluateControl"))) {
    issues.push("Control layer must evaluate rules before execution");
  }

  if (!blueprint.controlFlow.some((step) => step.startsWith("control.intercepted"))) {
    issues.push("Control layer must sit above execution via intercepted wrappers");
  }

  if (!blueprint.executionFlow.some((step) => step.startsWith("observability."))) {
    issues.push("Observability must span execution flow");
  }

  const observabilityModules = blueprint.modules.observability;
  if (!observabilityModules || !observabilityModules.includes("observability")) {
    issues.push("Observability module mapping is missing");
  }

  const queryMutates = blueprint.executionFlow.some(
    (step) => step.startsWith("query.") && step.includes("mutate")
  );
  if (queryMutates) {
    issues.push("Query layer must not mutate state");
  }

  const reasoningDependsOnDomainDirectly = blueprint.dataFlow.some(
    (edge) => edge.startsWith("domain.") && edge.includes("reasoning")
  );
  if (reasoningDependsOnDomainDirectly) {
    issues.push("Reasoning must depend only on query layer, not domain directly");
  }

  const reasoningQueryEdges = blueprint.dataFlow.filter((edge) =>
    edge.includes("query.") && edge.includes("reasoning")
  );
  if (reasoningQueryEdges.length === 0) {
    issues.push("Reasoning layer must depend on query layer outputs");
  }

  const controlIndex = blueprint.layers.indexOf("control");
  const domainIndex = blueprint.layers.indexOf("domain");
  if (controlIndex === -1 || domainIndex === -1 || controlIndex >= domainIndex) {
    issues.push("Control layer must sit above domain execution layer");
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
