import type { z } from 'zod';

/**
 * A named slice of configuration: the env keys one package needs, validated by one schema.
 * Packages declare their own definition; apps list the definitions they boot with.
 */
export interface ConfigDefinition<
  Schema extends z.ZodType = z.ZodType,
  Key extends string = string,
> {
  readonly key: Key;
  readonly schema: Schema;
  readonly token: `config:${Key}`;
}

export type ConfigType<Definition extends ConfigDefinition> = z.output<Definition['schema']>;

export function defineConfig<const Key extends string, Schema extends z.ZodType>(
  key: Key,
  schema: Schema,
): ConfigDefinition<Schema, Key> {
  return { key, schema, token: `config:${key}` };
}
