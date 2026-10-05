import type { Redis } from '@template/redis';

/** Redis list holding captured emails, newest first. */
export const OUTBOX_KEY = 'mail:outbox';
const OUTBOX_MAX_LENGTH = 1_000;
const OUTBOX_TTL_SECONDS = 24 * 3600;

export interface CapturedEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  tag: string;
  idempotencyKey?: string;
  capturedAt: string;
}

export async function pushToOutbox(redis: Redis, email: CapturedEmail): Promise<void> {
  await redis
    .multi()
    .lpush(OUTBOX_KEY, JSON.stringify(email))
    .ltrim(OUTBOX_KEY, 0, OUTBOX_MAX_LENGTH - 1)
    .expire(OUTBOX_KEY, OUTBOX_TTL_SECONDS)
    .exec();
}

export async function readOutbox(redis: Redis): Promise<CapturedEmail[]> {
  return (await redis.lrange(OUTBOX_KEY, 0, -1)).map((raw) => JSON.parse(raw) as CapturedEmail);
}

export async function clearOutbox(redis: Redis): Promise<void> {
  await redis.del(OUTBOX_KEY);
}

/** Polls the outbox until an email to `to` (and of `tag`, if given) arrives. */
export async function waitForEmail(
  redis: Redis,
  { to, tag, timeoutMs = 10_000 }: { to: string; tag?: string; timeoutMs?: number },
): Promise<CapturedEmail> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const email = (await readOutbox(redis)).find(
      (candidate) => candidate.to === to && (!tag || candidate.tag === tag),
    );
    if (email) return email;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`No ${tag ?? ''} email to ${to} within ${timeoutMs} ms`);
}

/** Pulls the `token` query parameter out of the first link to `path` in an email. */
export function extractToken(email: CapturedEmail, path: string): string {
  const match = new RegExp(`https?://[^\\s"]*${path}\\?token=([\\w%-]+)`).exec(email.text);
  if (!match?.[1]) throw new Error(`No ${path} link in email "${email.subject}"`);
  return decodeURIComponent(match[1]);
}
