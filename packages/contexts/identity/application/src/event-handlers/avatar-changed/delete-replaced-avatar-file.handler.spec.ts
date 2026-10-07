import { describe, expect, it } from 'bun:test';
import { AvatarChangedEvent } from '@template/identity-domain';

import { FakeIdentityHousekeeping } from '../../testing/fakes/fake-identity-housekeeping.ts';
import { DeleteReplacedAvatarFileHandler } from './delete-replaced-avatar-file.handler.ts';

const now = new Date('2026-01-01T00:00:00Z');

describe('DeleteReplacedAvatarFileHandler', () => {
  it('schedules the deletion of the replaced file only', async () => {
    const housekeeping = new FakeIdentityHousekeeping();
    const handler = new DeleteReplacedAvatarFileHandler(housekeeping);

    await handler.handle(new AvatarChangedEvent('u', 'identity/avatars/u/1.png', null, now));
    await handler.handle(
      new AvatarChangedEvent('u', 'identity/avatars/u/2.png', 'identity/avatars/u/1.png', now),
    );

    expect(housekeeping.avatarFilesToDelete).toEqual(['identity/avatars/u/1.png']);
  });

  it('never fails the change when the job cannot be enqueued', async () => {
    const housekeeping = new FakeIdentityHousekeeping();
    housekeeping.deleteAvatarFile = async () => {
      throw new Error('redis down');
    };
    const handler = new DeleteReplacedAvatarFileHandler(housekeeping);

    await handler.handle(new AvatarChangedEvent('u', null, 'identity/avatars/u/1.png', now));
  });
});
