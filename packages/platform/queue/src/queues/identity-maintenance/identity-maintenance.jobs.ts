import { z } from 'zod';

import { defineJob } from '../../core/define-job.js';
import { identityMaintenanceQueue } from './identity-maintenance.queue.js';

export const purgeExpiredSessionsJob = defineJob(
  identityMaintenanceQueue,
  'purge-expired-sessions',
  z.object({}),
  { attempts: 1 },
);
