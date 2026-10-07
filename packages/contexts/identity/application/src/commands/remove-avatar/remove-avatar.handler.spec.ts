import { describe, expect, it } from 'bun:test';
import { AvatarChangedEvent } from '@template/identity-domain';

import { createIdentityTestKit } from '../../testing/identity-test-kit.ts';
import { RemoveAvatarCommand } from './remove-avatar.command.ts';
import { RemoveAvatarHandler } from './remove-avatar.handler.ts';

describe('RemoveAvatarHandler', () => {
  it('removes the avatar and names its file in the event; a second removal changes nothing', async () => {
    const kit = createIdentityTestKit();
    const user = await kit.givenUser();
    user.changeAvatar('identity/avatars/u/1.png', kit.clock.now());
    user.pullDomainEvents();
    await kit.users.save(user);
    const handler = new RemoveAvatarHandler(kit.users, kit.clock, kit.eventBus.asEventBus());

    await handler.execute(new RemoveAvatarCommand(user.id.value));
    await handler.execute(new RemoveAvatarCommand(user.id.value));

    expect((await kit.users.findById(user.id))?.avatarKey).toBeNull();
    expect(kit.eventBus.published).toEqual([
      new AvatarChangedEvent(user.id.value, null, 'identity/avatars/u/1.png', kit.clock.now()),
    ]);
  });
});
