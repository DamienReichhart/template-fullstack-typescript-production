import { describe, expect, it } from 'bun:test';

import { translateIssue } from './translate-zod-issue';

const catalog: Record<string, string> = {
  'validation.password.tooShort': 'Use at least {minimum} characters.',
  'validation.generic.invalid': 'This value is invalid.',
};

const t = Object.assign(
  (key: string, values: Record<string, string | number> = {}) =>
    (catalog[key] ?? key).replace(/\{(\w+)\}/g, (_, name: string) => String(values[name])),
  { has: (key: string) => key in catalog },
) as unknown as Parameters<typeof translateIssue>[0];

describe('translateIssue', () => {
  it('translates a known key with its params', () => {
    expect(
      translateIssue(t, { message: 'validation.password.tooShort', params: { minimum: 12 } }),
    ).toBe('Use at least 12 characters.');
  });

  it('falls back to a generic message for unknown keys', () => {
    expect(translateIssue(t, { message: 'Expected string, received number' })).toBe(
      'This value is invalid.',
    );
  });
});
