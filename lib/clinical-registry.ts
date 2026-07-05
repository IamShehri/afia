import type { ClinicalEvent } from "./clinical-event";

export type ClinicalModuleSource = {
  module: string;
  getEvents: (patientId: string) => ClinicalEvent[];
};

const registry: ClinicalModuleSource[] = [];

export function registerClinicalModule(source: ClinicalModuleSource) {
  registry.push(source);
}

export function getRegistry() {
  return registry;
}
