import { defineSchedule } from '@template/messaging';
import { purgeExpiredSessionsJob } from '@template/queue';

/** Recurring jobs of the `identity-maintenance` queue. Ids are stable: renaming one re-creates it. */
export const identityMaintenanceSchedules = [
  defineSchedule({
    id: 'identity:purge-expired-sessions',
    job: purgeExpiredSessionsJob,
    pattern: '0 3 * * *',
    timezone: 'UTC',
    payload: {},
  }),
];
