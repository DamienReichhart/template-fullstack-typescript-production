import { describe, expect, it } from 'bun:test';

import { CryptoSecureTokenGenerator } from './crypto-secure-token-generator.js';

const generator = new CryptoSecureTokenGenerator();

describe('CryptoSecureTokenGenerator', () => {
  it('generates unique url-safe tokens with a matching hash', () => {
    const first = generator.generate();
    const second = generator.generate();

    expect(first.token).toMatch(/^[\w-]{43}$/);
    expect(first.token).not.toBe(second.token);
    expect(generator.hash(first.token)).toBe(first.hash);
    expect(first.hash).not.toBe(first.token);
  });
});
