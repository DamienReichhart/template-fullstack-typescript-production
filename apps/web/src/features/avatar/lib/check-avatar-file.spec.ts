import { describe, expect, it } from 'bun:test';

import { checkAvatarFile } from './check-avatar-file';

describe('checkAvatarFile', () => {
  it('accepts PNG, JPEG and WebP pictures up to 5 MB', () => {
    expect(checkAvatarFile({ type: 'image/webp', size: 5 * 1024 * 1024 })).toBeNull();
  });

  it('names the rule a file breaks', () => {
    expect(checkAvatarFile({ type: 'image/svg+xml', size: 10 })).toBe(
      'validation.avatar.contentType',
    );
    expect(checkAvatarFile({ type: 'image/png', size: 0 })).toBe('validation.avatar.empty');
    expect(checkAvatarFile({ type: 'image/png', size: 5 * 1024 * 1024 + 1 })).toBe(
      'validation.avatar.tooLarge',
    );
  });
});
