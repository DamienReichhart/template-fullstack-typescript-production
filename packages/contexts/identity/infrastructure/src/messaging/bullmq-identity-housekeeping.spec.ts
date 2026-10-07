import { describe, expect, it, mock } from 'bun:test';
import type { JobProducer } from '@template/messaging';
import { deleteAvatarFileJob } from '@template/queue';

import { BullMqIdentityHousekeeping } from './bullmq-identity-housekeeping.ts';

describe('BullMqIdentityHousekeeping', () => {
  it('enqueues the deletion of an avatar file with a payload the job contract accepts', async () => {
    const enqueue = mock(async () => 'job-id');
    const housekeeping = new BullMqIdentityHousekeeping({ enqueue } as unknown as JobProducer);

    await housekeeping.deleteAvatarFile('identity/avatars/u/1');

    expect(enqueue).toHaveBeenCalledWith(deleteAvatarFileJob, {
      avatarKey: 'identity/avatars/u/1',
    });
    expect(
      deleteAvatarFileJob.schema.safeParse({ avatarKey: 'identity/avatars/u/1' }).success,
    ).toBe(true);
    expect(deleteAvatarFileJob.schema.safeParse({ avatarKey: 'billing/invoices/1' }).success).toBe(
      false,
    );
  });
});
