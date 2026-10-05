import { Injectable } from '@nestjs/common';
import { hash, verify } from '@node-rs/argon2';
import { PasswordHasher } from '@template/identity-application';

/** OWASP Password Storage Cheat Sheet: argon2id, 19 MiB, 2 iterations, 1 lane. */
export const ARGON2_OPTIONS = {
  // `Algorithm.Argon2id` is an ambient const enum, unreadable under `verbatimModuleSyntax`.
  algorithm: 2,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

@Injectable()
export class Argon2PasswordHasher extends PasswordHasher {
  hash(password: string): Promise<string> {
    return hash(password, ARGON2_OPTIONS);
  }

  async verify(passwordHash: string, password: string): Promise<boolean> {
    try {
      return await verify(passwordHash, password);
    } catch {
      // A malformed stored hash is a failed verification, never a crash of the login.
      return false;
    }
  }
}
