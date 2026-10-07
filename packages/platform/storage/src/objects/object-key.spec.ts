import { describe, expect, it } from 'bun:test';

import { assertObjectKey, InvalidObjectKeyError, objectKey, objectPrefix } from './object-key.ts';

describe('objectKey', () => {
  it('joins safe segments with slashes', () => {
    expect(objectKey('identity', 'avatars', 'u-1', 'a.webp')).toBe('identity/avatars/u-1/a.webp');
    expect(objectPrefix('identity', 'avatars')).toBe('identity/avatars/');
  });

  it.each([
    ['a segment holding a slash', ['identity', 'a/../b']],
    ['a parent segment', ['identity', '..', 'secrets']],
    ['an empty segment', ['identity', '', 'x']],
    ['spaces and control characters', ['identity', 'a b\n']],
  ])('rejects %s', (_case, segments) => {
    expect(() => objectKey(...segments)).toThrow(InvalidObjectKeyError);
  });
});

describe('assertObjectKey', () => {
  it('rejects leading and trailing slashes and keys over 1024 bytes', () => {
    expect(() => assertObjectKey('/identity/x')).toThrow(InvalidObjectKeyError);
    expect(() => assertObjectKey('identity/x/')).toThrow(InvalidObjectKeyError);
    expect(() => assertObjectKey('a'.repeat(1025))).toThrow(InvalidObjectKeyError);
    expect(() => assertObjectKey('identity/x')).not.toThrow();
  });
});
