import { afterAll, beforeAll, beforeEach } from 'bun:test';

import { redis, resetRateLimits } from './redis.ts';
import { ensureServers } from './servers.ts';

let stopServers: () => void = () => undefined;

beforeAll(async () => {
  await redis.connect();
  stopServers = await ensureServers();
}, 90_000);

beforeEach(resetRateLimits);

afterAll(() => {
  stopServers();
  redis.disconnect();
});
