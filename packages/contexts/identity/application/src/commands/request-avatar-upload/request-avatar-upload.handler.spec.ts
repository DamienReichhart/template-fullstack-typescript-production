import { describe, expect, it } from 'bun:test';
import { InvalidAvatarError, UserNotFoundError } from '@template/identity-domain';

import { createIdentityTestKit } from '../../testing/identity-test-kit.ts';
import { RequestAvatarUploadCommand } from './request-avatar-upload.command.ts';
import { RequestAvatarUploadHandler } from './request-avatar-upload.handler.ts';

describe('RequestAvatarUploadHandler', () => {
  it('issues an upload ticket for an acceptable picture', async () => {
    const kit = createIdentityTestKit();
    const user = await kit.givenUser({ verified: true });

    const ticket = await new RequestAvatarUploadHandler(kit.users, kit.avatars).execute(
      new RequestAvatarUploadCommand(user.id.value, 'image/webp', 2048),
    );

    expect(ticket.fields['Content-Type']).toBe('image/webp');
    expect(kit.avatars.uploads.get(ticket.uploadId)).toMatchObject({ userId: user.id.value });
  });

  it('refuses a picture breaking the avatar rules before issuing anything', async () => {
    const kit = createIdentityTestKit();
    const user = await kit.givenUser();
    const handler = new RequestAvatarUploadHandler(kit.users, kit.avatars);

    await expect(
      handler.execute(new RequestAvatarUploadCommand(user.id.value, 'image/svg+xml', 10)),
    ).rejects.toBeInstanceOf(InvalidAvatarError);
    expect(kit.avatars.uploads.size).toBe(0);
  });

  it('fails for a user that no longer exists', async () => {
    const kit = createIdentityTestKit();
    await expect(
      new RequestAvatarUploadHandler(kit.users, kit.avatars).execute(
        new RequestAvatarUploadCommand('0199b0a0-0000-7000-8000-000000000001', 'image/png', 10),
      ),
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });
});
