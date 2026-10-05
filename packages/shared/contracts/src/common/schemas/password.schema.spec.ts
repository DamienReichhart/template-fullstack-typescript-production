import { describe, expect, it } from 'bun:test';

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, passwordSchema } from './password.schema.ts';

describe('passwordSchema', () => {
  it('accepts a passphrase within bounds', () => {
    expect(passwordSchema.safeParse('correct horse battery').success).toBe(true);
  });

  it('rejects a password shorter than the minimum with a translatable key', () => {
    const result = passwordSchema.safeParse('a'.repeat(PASSWORD_MIN_LENGTH - 1));
    expect(result.error?.issues[0]?.message).toBe('validation.password.tooShort');
  });

  it('rejects a password longer than the maximum', () => {
    const result = passwordSchema.safeParse('a'.repeat(PASSWORD_MAX_LENGTH + 1));
    expect(result.error?.issues[0]?.message).toBe('validation.password.tooLong');
  });
});
