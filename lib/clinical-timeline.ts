import "./clinical-modules";
import { getRegistry } from "./clinical-registry";

export function composePatientTimeline(patientId: string) {
  const sources = getRegistry();

  const events = sources.flatMap((s) => s.getEvents(patientId));

  return events.sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}
