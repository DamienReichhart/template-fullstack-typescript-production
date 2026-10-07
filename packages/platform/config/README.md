# @template/config

Typed, fail-fast configuration. Each package declares the env keys it needs as a
**config definition** (a Zod schema plus a key); each app boots `ConfigModule.forRoot()` with
the definitions it uses. All definitions are validated together, so a broken deploy lists
every missing or invalid variable in one error.

## Layout

| Path               | Holds                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `config.module.ts` | `ConfigModule.forRoot({ definitions })`: global, one provider per definition                                             |
| `loader/`          | `defineConfig`, `loadConfig`, error formatting                                                                           |
| `decorators/`      | `@InjectConfig(definition)`                                                                                              |
| `schemas/`         | Platform definitions: `appConfig`, `databaseConfig`, `redisConfig`, `storageConfig`, `httpConfig`, `defineProbeConfig()` |

## Usage

```ts
constructor(@InjectConfig(databaseConfig) private readonly config: ConfigType<typeof databaseConfig>) {}
```

Context-specific definitions live with their owner (e.g. `identityConfig` in
`@template/identity-infrastructure`), never here.
