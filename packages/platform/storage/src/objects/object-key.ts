const MAX_KEY_BYTES = 1024;
// Letters, digits and the punctuation S3 documents as safe: nothing that needs encoding in a URL
// path, no control characters, no backslashes that some tools treat as separators.
const SAFE_SEGMENT = /^[A-Za-z0-9!_.*'()-]+$/;

export class InvalidObjectKeyError extends Error {
  constructor(key: string, reason: string) {
    super(`Invalid object key "${key}": ${reason}`);
    this.name = 'InvalidObjectKeyError';
  }
}

/**
 * Throws unless `key` is a safe object key: `/`-separated safe segments, no empty, `.` or `..`
 * segment, no leading or trailing slash, at most 1024 bytes. Keys built from user input can
 * then never escape the prefix they were built under.
 */
export function assertObjectKey(key: string): void {
  if (Buffer.byteLength(key) > MAX_KEY_BYTES) {
    throw new InvalidObjectKeyError(key, `longer than ${MAX_KEY_BYTES} bytes`);
  }
  for (const segment of key.split('/')) {
    if (segment === '' || segment === '.' || segment === '..') {
      throw new InvalidObjectKeyError(key, 'empty, "." or ".." segment');
    }
    if (!SAFE_SEGMENT.test(segment)) {
      throw new InvalidObjectKeyError(key, `unsafe characters in "${segment}"`);
    }
  }
}

/** Joins segments into a validated key: `objectKey('identity', 'avatars', userId)`. */
export function objectKey(...segments: string[]): string {
  const key = segments.join('/');
  for (const segment of segments) {
    if (segment.includes('/')) throw new InvalidObjectKeyError(key, `"${segment}" contains "/"`);
  }
  assertObjectKey(key);
  return key;
}

/** Prefix form of a key (`identity/avatars/`), for listing. */
export function objectPrefix(...segments: string[]): string {
  return `${objectKey(...segments)}/`;
}
