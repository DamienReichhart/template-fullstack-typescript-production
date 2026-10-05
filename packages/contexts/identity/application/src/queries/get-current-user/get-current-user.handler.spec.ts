import { describe, expect, it } from 'bun:test';
import { UserNotFoundError } from '@template/identity-domain';

import { createIdentityTestKit } from '../../testing/identity-test-kit.ts';
import { GetCurrentUserHandler } from './get-current-user.handler.ts';
import { GetCurrentUserQuery } from './get-current-user.query.ts';

describe('GetCurrentUserHandler', () => {
  it('returns the view of the user', async () => {
    const kit = createIdentityTestKit();
    const user = await kit.givenUser({ verified: true });

    const view = await new GetCurrentUserHandler(kit.users).execute(
      new GetCurrentUserQuery(user.id.value),
    );

    expect(view).toEqual({
      id: user.id.value,
      email: 'ada@example.com',
      name: 'Ada',
      role: 'USER',
      locale: 'en',
      emailVerified: true,
      createdAt: kit.clock.now(),
    });
  });

  it('fails for a user that no longer exists', async () => {
    const kit = createIdentityTestKit();
    await expect(
      new GetCurrentUserHandler(kit.users).execute(
        new GetCurrentUserQuery('0199b0a0-0000-7000-8000-000000000001'),
      ),
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });
});
