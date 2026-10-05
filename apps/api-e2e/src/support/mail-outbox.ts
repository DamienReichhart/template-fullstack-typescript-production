import { extractToken, waitForEmail } from '@template/notifications-infrastructure/testing';

import { redis } from './redis.ts';

/** Email tags set by the notifications context, one per template. */
export type EmailTag = 'welcome' | 'verify-email' | 'reset-password';

/**
 * Waits for the worker to deliver an email to the capture outbox and returns the token of
 * the link it carries. The worker must run with MAIL_TRANSPORT=capture.
 */
export async function tokenFromEmail(to: string, tag: EmailTag, path: string): Promise<string> {
  try {
    return extractToken(await waitForEmail(redis, { to, tag, timeoutMs: 15_000 }), path);
  } catch (error) {
    throw new Error(
      `${(error as Error).message}. Is the worker running with MAIL_TRANSPORT=capture?`,
      { cause: error },
    );
  }
}

export { waitForEmail } from '@template/notifications-infrastructure/testing';
