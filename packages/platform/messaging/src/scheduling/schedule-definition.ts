import type { JobDefinition, JobPayload } from '@template/queue';

/** A recurring job: run `job` with `payload` on the cron `pattern` (UTC unless `timezone`). */
export interface ScheduleDefinition<Definition extends JobDefinition = JobDefinition> {
  /** Stable id: renaming it creates a new scheduler and prunes the old one. */
  readonly id: string;
  readonly job: Definition;
  readonly pattern: string;
  readonly payload: JobPayload<Definition>;
  readonly timezone?: string;
}

export function defineSchedule<Definition extends JobDefinition>(
  schedule: ScheduleDefinition<Definition>,
): ScheduleDefinition<Definition> {
  return schedule;
}

/** Holds the schedules contributed by one module; discovered by the registrar at boot. */
export class ScheduleBundle {
  constructor(readonly schedules: readonly ScheduleDefinition[]) {}
}
