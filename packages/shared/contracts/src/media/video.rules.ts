/**
 * What a Video may be. The media domain enforces the same rules (a spec in `@template/media-http`
 * keeps both in step); here they let forms refuse a file early.
 */
export const VIDEO_CONTENT_TYPES = ['video/mp4', 'video/quicktime'] as const;
export const VIDEO_MAX_BYTES = 2 * 1024 * 1024 * 1024;
export const VIDEO_MAX_DURATION_SECONDS = 10 * 60;
