/**
 * Contract schemas and the API use translation keys as validation messages
 * (`validation.password.tooShort`) with ICU params (`{ minimum: 12 }`).
 */
export interface TranslatableIssue {
  message: string;
  params?: Record<string, string | number | boolean>;
}

type Translator = {
  (key: never, values?: Record<string, string | number>): string;
  has: (key: never) => boolean;
};

const FALLBACK_KEY = 'validation.generic.invalid';

/** Translates an issue, falling back to a generic message for unknown keys. */
export function translateIssue(t: Translator, issue: TranslatableIssue): string {
  const values = Object.fromEntries(
    Object.entries(issue.params ?? {}).filter(
      (entry): entry is [string, string | number] => typeof entry[1] !== 'boolean',
    ),
  );
  const key = t.has(issue.message as never) ? issue.message : FALLBACK_KEY;
  return t(key as never, values);
}

const PARAM_KEYS = ['minimum', 'maximum', 'expected', 'format'] as const;

/** The ICU params of a Zod issue (`{ minimum: 12 }`), as the API sends them in field errors. */
export function issueParams(issue: object): Record<string, string | number> {
  return Object.fromEntries(
    PARAM_KEYS.flatMap((key) => {
      const value = (issue as Record<string, unknown>)[key];
      return typeof value === 'string' || typeof value === 'number' ? [[key, value]] : [];
    }),
  );
}
