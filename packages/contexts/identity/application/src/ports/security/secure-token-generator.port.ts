export interface GeneratedToken {
  /** Sent to the user (cookie, email link). Never stored. */
  token: string;
  /** Stored and compared. */
  hash: string;
}

/** Unguessable secrets for refresh tokens and one-time tokens, stored only as hashes. */
export abstract class SecureTokenGenerator {
  abstract generate(): GeneratedToken;
  abstract hash(token: string): string;
}
