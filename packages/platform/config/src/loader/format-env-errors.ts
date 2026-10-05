import type { z } from 'zod';

export interface EnvIssue {
  definition: string;
  variable: string;
  message: string;
}

export function toEnvIssues(definition: string, error: z.ZodError): EnvIssue[] {
  return error.issues.map((issue) => ({
    definition,
    variable: issue.path.join('.') || '(root)',
    message: issue.message,
  }));
}

export function formatEnvErrors(issues: EnvIssue[]): string {
  const lines = issues.map(
    (issue) => `  • ${issue.variable.padEnd(28)} ${issue.message} [${issue.definition}]`,
  );
  return [
    `Invalid environment configuration (${issues.length} issue${issues.length > 1 ? 's' : ''}):`,
    ...lines,
    'Check your .env file against .env.example.',
  ].join('\n');
}
