import { PasswordHasher } from '../../ports/security/password-hasher.port.js';

/** Reversible on purpose: tests can assert which password was hashed. */
export class FakePasswordHasher extends PasswordHasher {
  readonly hashed: string[] = [];

  async hash(password: string): Promise<string> {
    this.hashed.push(password);
    return `hashed:${password}`;
  }

  async verify(hash: string, password: string): Promise<boolean> {
    return hash === `hashed:${password}`;
  }
}
