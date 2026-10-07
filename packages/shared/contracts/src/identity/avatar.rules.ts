/**
 * What an Avatar may be. The identity domain enforces the same rules (a spec in
 * `@template/identity-http` keeps both in step); here they let forms refuse a file early.
 */
export const AVATAR_CONTENT_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
