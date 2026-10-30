import { ValueObject } from '@template/ddd';

import { InvalidVideoError } from '../errors/invalid-video.error.ts';

/** What phones and cameras record, and whose file signature the server can check. */
export const VIDEO_CONTENT_TYPES = ['video/mp4', 'video/quicktime'] as const;
export const VIDEO_MAX_BYTES = 2 * 1024 * 1024 * 1024;

export type VideoContentType = (typeof VIDEO_CONTENT_TYPES)[number];

const isVideoContentType = (value: string): value is VideoContentType =>
  (VIDEO_CONTENT_TYPES as readonly string[]).includes(value);

/** A file a User announces before sending it as a Video: what it is and how big. */
export class VideoFile extends ValueObject<{ contentType: VideoContentType; size: number }> {
  static create(contentType: string, size: number): VideoFile {
    if (!isVideoContentType(contentType)) throw new InvalidVideoError('content-type');
    if (!Number.isInteger(size) || size <= 0) throw new InvalidVideoError('empty');
    if (size > VIDEO_MAX_BYTES) throw new InvalidVideoError('too-large');
    return new VideoFile({ contentType, size });
  }

  get contentType(): VideoContentType {
    return this.props.contentType;
  }

  get size(): number {
    return this.props.size;
  }
}
