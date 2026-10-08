import { describe, expect, it } from 'bun:test';
import {
  AvatarChangedEvent,
  AvatarImage,
  AvatarUploadNotFoundError,
  InvalidAvatarError,
} from '@template/identity-domain';

import { createIdentityTestKit } from '../../testing/identity-test-kit.ts';
import { ChangeAvatarCommand } from './change-avatar.command.ts';
import { ChangeAvatarHandler } from './change-avatar.handler.ts';

async function setup() {
  const kit = createIdentityTestKit();
  const user = await kit.givenUser({ verified: true });
  const handler = new ChangeAvatarHandler(
    kit.users,
    kit.avatars,
    kit.clock,
    kit.eventBus.asEventBus(),
  );
  const upload = async () => {
    const ticket = await kit.avatars.issueUpload(
      user.id.value,
      AvatarImage.create('image/png', 10),
    );
    kit.avatars.receive(ticket.uploadId);
    return ticket.uploadId;
  };
  return { kit, user, handler, upload };
}

describe('ChangeAvatarHandler', () => {
  it('keeps the uploaded file and shows it as the avatar', async () => {
    const { kit, user, handler, upload } = await setup();
    const uploadId = await upload();

    await handler.execute(new ChangeAvatarCommand(user.id.value, uploadId));

    const key = `identity/avatars/${user.id.value}/${uploadId}`;
    expect((await kit.users.findById(user.id))?.avatarKey).toBe(key);
    expect(kit.eventBus.published).toEqual([
      new AvatarChangedEvent(user.id.value, key, null, kit.clock.now()),
    ]);
  });

  it('names the replaced file in the event, so it can be deleted', async () => {
    const { kit, user, handler, upload } = await setup();
    const first = await upload();
    await handler.execute(new ChangeAvatarCommand(user.id.value, first));
    const second = await upload();

    await handler.execute(new ChangeAvatarCommand(user.id.value, second));

    expect(kit.eventBus.published.at(-1)).toMatchObject({
      previousAvatarKey: `identity/avatars/${user.id.value}/${first}`,
    });
  });

  it("refuses an upload that was never sent, or another user's", async () => {
    const { kit, user, handler, upload } = await setup();
    const uploadId = await upload();
    const intruder = await kit.givenUser({ email: 'eve@example.com' });

    await expect(
      handler.execute(new ChangeAvatarCommand(intruder.id.value, uploadId)),
    ).rejects.toBeInstanceOf(AvatarUploadNotFoundError);
    const ticket = await kit.avatars.issueUpload(user.id.value, AvatarImage.create('image/png', 1));
    await expect(
      handler.execute(new ChangeAvatarCommand(user.id.value, ticket.uploadId)),
    ).rejects.toBeInstanceOf(AvatarUploadNotFoundError);
  });

  it('leaves the avatar unchanged when the file is not what was announced', async () => {
    const { kit, user, handler } = await setup();
    const ticket = await kit.avatars.issueUpload(
      user.id.value,
      AvatarImage.create('image/png', 10),
    );
    kit.avatars.receive(ticket.uploadId, { contentType: 'text/html', size: 10 });

    await expect(
      handler.execute(new ChangeAvatarCommand(user.id.value, ticket.uploadId)),
    ).rejects.toBeInstanceOf(InvalidAvatarError);
    expect((await kit.users.findById(user.id))?.avatarKey).toBeNull();
    expect(kit.eventBus.published).toHaveLength(0);
  });
});
