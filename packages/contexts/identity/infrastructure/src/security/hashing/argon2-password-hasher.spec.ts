import { describe, expect, it } from 'bun:test';

import { Argon2PasswordHasher } from './argon2-password-hasher.ts';

const hasher = new Argon2PasswordHasher();

describe('Argon2PasswordHasher', () => {
  it('produces salted argon2id hashes that verify the original password only', async () => {
    const first = await hasher.hash('correct horse battery');
    const second = await hasher.hash('correct horse battery');

    expect(first).toStartWith('$argon2id$');
    expect(first).not.toBe(second);
    expect(await hasher.verify(first, 'correct horse battery')).toBe(true);
    expect(await hasher.verify(first, 'wrong horse battery')).toBe(false);
  });

  it('treats a malformed hash as a failed verification', async () => {
    expect(await hasher.verify('not-a-hash', 'anything')).toBe(false);
  });
});
