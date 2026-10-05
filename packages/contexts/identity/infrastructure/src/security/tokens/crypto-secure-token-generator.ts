import { createHash, randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { SecureTokenGenerator, type GeneratedToken } from '@template/identity-application';

/**
 * 256 bits of randomness, URL-safe. Stored as SHA-256: tokens are high-entropy, so a fast
 * hash is enough and lookups stay a single indexed equality.
 */
@Injectable()
export class CryptoSecureTokenGenerator extends SecureTokenGenerator {
  generate(): GeneratedToken {
    const token = randomBytes(32).toString('base64url');
    return { token, hash: this.hash(token) };
  }

  hash(token: string): string {
    return createHash('sha256').update(token).digest('base64url');
  }
}
