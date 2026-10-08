import { describe, expect, it } from 'bun:test';

import { createIdentityTestKit } from '../../testing/identity-test-kit.ts';
import { DeleteAvatarFileCommand } from './delete-avatar-file.command.ts';
import { DeleteAvatarFileHandler } from './delete-avatar-file.handler.ts';

describe('DeleteAvatarFileHandler', () => {
  it('deletes the file, idempotently', async () => {
    const kit = createIdentityTestKit();
    kit.avatars.files.add('identity/avatars/u/1.png');
    const handler = new DeleteAvatarFileHandler(kit.avatars);

    await handler.execute(new DeleteAvatarFileCommand('identity/avatars/u/1.png'));
    await handler.execute(new DeleteAvatarFileCommand('identity/avatars/u/1.png'));

    expect(kit.avatars.files.size).toBe(0);
  });
});
