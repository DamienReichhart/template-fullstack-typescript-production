import {
  SecureTokenGenerator,
  type GeneratedToken,
} from '../../ports/security/secure-token-generator.port.ts';

/** Deterministic tokens: `token-1`, `token-2`, … hashed as `hash(token-n)`. */
export class FakeSecureTokenGenerator extends SecureTokenGenerator {
  private counter = 0;

  generate(): GeneratedToken {
    const token = `token-${++this.counter}`;
    return { token, hash: this.hash(token) };
  }

  hash(token: string): string {
    return `hash(${token})`;
  }
}
