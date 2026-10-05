export interface DependencyStatus {
  status: 'up' | 'down';
  latencyMs?: number;
  message?: string;
}

/** Times a probe and turns its outcome into a status. Never throws. */
export async function measure(probe: () => Promise<unknown>): Promise<DependencyStatus> {
  const startedAt = performance.now();
  try {
    await probe();
    return { status: 'up', latencyMs: Math.round(performance.now() - startedAt) };
  } catch (error) {
    return { status: 'down', message: error instanceof Error ? error.message : String(error) };
  }
}
