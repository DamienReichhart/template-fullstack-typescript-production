# @template/redis

The shared Redis client (ioredis) for caching, rate limiting and ad-hoc commands.
BullMQ opens its own connections through `@template/messaging`.

| Path              | Holds                                                                        |
| ----------------- | ---------------------------------------------------------------------------- |
| `redis.module.ts` | `RedisModule.forRoot({ connectionName })`: global client, closed on shutdown |
| `redis.tokens.ts` | `REDIS_CLIENT` token and `@InjectRedis()`                                    |
| `connection/`     | `createRedisConnection(url)` for code that needs its own client              |

```ts
constructor(@InjectRedis() private readonly redis: Redis) {}
```
