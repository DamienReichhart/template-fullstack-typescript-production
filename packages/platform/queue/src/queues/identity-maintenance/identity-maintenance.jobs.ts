import { z } from 'zod';

import { defineJob } from '../../core/define-job.ts';
import { identityMaintenanceQueue } from './identity-maintenance.queue.ts';

export const purgeExpiredSessionsJob = defineJob(
  identityMaintenanceQueue,
  'purge-expired-sessions',
  z.object({}),
  { attempts: 1 },
);
