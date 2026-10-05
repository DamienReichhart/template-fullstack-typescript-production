import { describe, expect, it } from 'bun:test';

import { identityMaintenanceSchedules } from './identity-maintenance.schedules.ts';

describe('identityMaintenanceSchedules', () => {
  it('declares valid payloads for their jobs', () => {
    for (const schedule of identityMaintenanceSchedules) {
      expect(schedule.job.schema.safeParse(schedule.payload).success).toBe(true);
    }
  });

  it('uses unique ids', () => {
    const ids = identityMaintenanceSchedules.map((schedule) => schedule.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
