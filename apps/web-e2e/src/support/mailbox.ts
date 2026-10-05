import { RATE_LIMIT_KEY_PREFIX } from '@template/http';
import { waitForEmail } from '@template/notifications-infrastructure/testing';
import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

export type EmailTag = 'welcome' | 'verify-email' | 'reset-password';

/** The capture outbox and the rate-limit counters, both in Redis. */
export class Mailbox {
  private readonly redis = new Redis(redisUrl);

  /**
   * Waits for the worker to deliver an email and returns the path of the link it carries,
   * locale prefix included (e.g. `/fr/verify-email?token=…`), to open against the web app.
   */
  async linkFrom(to: string, tag: EmailTag, path: string): Promise<string> {
    const email = await waitForEmail(this.redis, { to, tag, timeoutMs: 15_000 });
    const link = new RegExp(`https?://[^\\s"]*${path}\\?token=[\\w%-]+`).exec(email.text)?.[0];
    if (!link) throw new Error(`No ${path} link in "${email.subject}"`);
    const url = new URL(link);
    return `${url.pathname}${url.search}`;
  }

  async resetRateLimits(): Promise<void> {
    const keys = await this.redis.keys(`${RATE_LIMIT_KEY_PREFIX}:*`);
    if (keys.length > 0) await this.redis.del(...keys);
  }

  close(): void {
    this.redis.disconnect();
  }
}
