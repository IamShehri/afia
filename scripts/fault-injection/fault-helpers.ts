export function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function assertTimelineSorted(timeline: { timestamp: number }[]): void {
  for (let i = 1; i < timeline.length; i++) {
    assert(
      timeline[i - 1].timestamp <= timeline[i].timestamp,
      `Timeline not sorted ascending at index ${i}`
    );
  }
}

export function runFaultTest(name: string, fn: () => void): void {
  try {
    fn();
    console.log("AFIA FAULT INJECTION TEST PASSED");
  } catch (error) {
    console.error(`[${name}]`, error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

export function assertNoThrow(label: string, fn: () => void): void {
  try {
    fn();
  } catch (error) {
    throw new Error(
      `${label} threw unexpectedly: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
