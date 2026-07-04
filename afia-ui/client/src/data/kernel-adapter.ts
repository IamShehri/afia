/**
 * Bridge between the AfiaUI frontend and the AFIA clinical kernel (repo-root `lib/`).
 *
 * The UI ships with static mock patients. This adapter seeds the in-memory kernel
 * (patient -> episode -> encounter -> clinical events -> timeline) from a UI patient
 * on demand, then exposes read-only projections (unified timeline + reasoning summary)
 * produced by the kernel's own query and reasoning layers.
 *
 * It does NOT modify any kernel module — it only consumes their public APIs.
 */
import { createPatient } from "@kernel/patient";
import { createEpisode, addEncounterToEpisode } from "@kernel/episode";
import { createEncounter, addEventToEncounter } from "@kernel/encounter";
// Explicit `/index` to resolve the module directory rather than the sibling
// composer file `lib/clinical-timeline.ts`.
import {
  appendEvent,
  createClinicalEvent,
} from "@kernel/clinical-timeline/index";
import { getPatientUnifiedTimeline } from "@kernel/query";
import { getPatientSummary } from "@kernel/reasoning";
import type { Patient, TimelineEvent } from "./types";

// Maps a UI patient MRN to the generated kernel patient id (seed-once, idempotent).
const seededPatients = new Map<string, string>();

function toTimestamp(iso: string): number {
  const parsed = Date.parse(iso);
  return Number.isNaN(parsed) ? Date.now() : parsed;
}

/**
 * Seeds the kernel from a UI patient exactly once. Returns the kernel patient id.
 * The UI patient's mock timeline is translated into kernel clinical events grouped
 * under a single episode + encounter so the query/reasoning layers have real data.
 */
export function ensurePatientSeeded(patient: Patient): string {
  const existing = seededPatients.get(patient.id);
  if (existing) {
    return existing;
  }

  const kernelPatient = createPatient({ name: patient.name });
  const episode = createEpisode(kernelPatient.id, patient.condition);
  const encounter = createEncounter(kernelPatient.id);
  addEncounterToEpisode(episode.id, encounter.id);

  for (const uiEvent of patient.timeline) {
    const event = createClinicalEvent({
      patientId: kernelPatient.id,
      timestamp: toTimestamp(uiEvent.at),
      eventType: uiEvent.type,
      payload: {
        title: uiEvent.title,
        detail: uiEvent.detail,
        author: uiEvent.author,
      },
    });
    addEventToEncounter(encounter.id, event.id);
    appendEvent(kernelPatient.id, event);
  }

  seededPatients.set(patient.id, kernelPatient.id);
  return kernelPatient.id;
}

/**
 * Returns the patient's timeline as reconstructed by the kernel query layer,
 * mapped back into the UI `TimelineEvent` shape for rendering.
 */
export function getKernelTimeline(patient: Patient): TimelineEvent[] {
  const kernelId = ensurePatientSeeded(patient);

  return getPatientUnifiedTimeline(kernelId).map((entry) => {
    const payload = (entry.payload ?? {}) as {
      title?: string;
      detail?: string;
      author?: string;
    };

    return {
      id: entry.id,
      at: new Date(entry.timestamp).toISOString(),
      type: entry.eventType as TimelineEvent["type"],
      title: payload.title ?? entry.eventType,
      detail: payload.detail,
      author: payload.author,
    };
  });
}

export type KernelPatientSummary = ReturnType<typeof getPatientSummary>;

/**
 * Returns the kernel reasoning layer's derived summary for a UI patient.
 */
export function getKernelSummary(patient: Patient): KernelPatientSummary {
  const kernelId = ensurePatientSeeded(patient);
  return getPatientSummary(kernelId);
}
