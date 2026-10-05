import type { ConfigDefinition, ConfigType } from './config-definition.ts';
import { formatEnvErrors, toEnvIssues, type EnvIssue } from './format-env-errors.ts';

export type EnvSource = Record<string, string | undefined>;

export class EnvValidationError extends Error {
  constructor(readonly issues: EnvIssue[]) {
    super(formatEnvErrors(issues));
    this.name = 'EnvValidationError';
  }
}

/**
 * Validates every definition against the environment at once, so a misconfigured deploy
 * reports all missing keys in a single error instead of one per restart.
 */
export function loadConfig<const Definitions extends readonly ConfigDefinition[]>(
  definitions: Definitions,
  source: EnvSource = process.env,
): { [D in Definitions[number] as D['key']]: ConfigType<D> } {
  const issues: EnvIssue[] = [];
  const values: Record<string, unknown> = {};

  for (const definition of definitions) {
    const result = definition.schema.safeParse(source);
    if (result.success) values[definition.key] = result.data;
    else issues.push(...toEnvIssues(definition.key, result.error));
  }

  if (issues.length > 0) throw new EnvValidationError(issues);
  return values as { [D in Definitions[number] as D['key']]: ConfigType<D> };
}
