import { z } from 'zod';

import { defineJob } from '../../core/define-job.ts';
import { identityMaintenanceQueue } from './identity-maintenance.queue.ts';

export const purgeExpiredSessionsJob = defineJob(
  identityMaintenanceQueue,
  'purge-expired-sessions',
  z.object({}),
  { attempts: 1 },
);

/** Deletes the object of a replaced or removed avatar. Retried: storage can be briefly away. */
export const deleteAvatarFileJob = defineJob(
  identityMaintenanceQueue,
  'delete-avatar-file',
  z.object({ avatarKey: z.string().startsWith('identity/avatars/') }),
);
