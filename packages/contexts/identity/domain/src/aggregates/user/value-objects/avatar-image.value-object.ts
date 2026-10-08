import { ValueObject } from '@template/ddd';

import { InvalidAvatarError } from '../errors/invalid-avatar.error.ts';

/** Picture formats every browser displays, and whose file signature the server can check. */
export const AVATAR_CONTENT_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

export type AvatarContentType = (typeof AVATAR_CONTENT_TYPES)[number];

const isAvatarContentType = (value: string): value is AvatarContentType =>
  (AVATAR_CONTENT_TYPES as readonly string[]).includes(value);

/** A picture a User announces before sending it: what it is and how big. */
export class AvatarImage extends ValueObject<{ contentType: AvatarContentType; size: number }> {
  static create(contentType: string, size: number): AvatarImage {
    if (!isAvatarContentType(contentType)) throw new InvalidAvatarError('content-type');
    if (!Number.isInteger(size) || size <= 0) throw new InvalidAvatarError('empty');
    if (size > AVATAR_MAX_BYTES) throw new InvalidAvatarError('too-large');
    return new AvatarImage({ contentType, size });
  }

  get contentType(): AvatarContentType {
    return this.props.contentType;
  }

  get size(): number {
    return this.props.size;
  }
}
