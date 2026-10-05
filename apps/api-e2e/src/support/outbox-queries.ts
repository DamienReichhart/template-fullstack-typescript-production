import { readOutbox, type CapturedEmail } from '@template/notifications-infrastructure/testing';

import { redis } from './redis.ts';

/** Every captured email to `to`, for asserting that nothing was sent. */
export async function readOutboxFor(to: string): Promise<CapturedEmail[]> {
  return (await readOutbox(redis)).filter((email) => email.to === to);
}
