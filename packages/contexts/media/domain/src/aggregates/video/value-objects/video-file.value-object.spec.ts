import { describe, expect, it } from 'bun:test';

import type { InvalidVideoError } from '../errors/invalid-video.error.ts';
import { VIDEO_MAX_BYTES, VideoFile } from './video-file.value-object.ts';

const reasonOf = (create: () => unknown) => {
  try {
    create();
  } catch (error) {
    return (error as InvalidVideoError).reason;
  }
  return undefined;
};

describe('VideoFile', () => {
  it('accepts MP4 and QuickTime files up to the size limit', () => {
    expect(VideoFile.create('video/mp4', VIDEO_MAX_BYTES).size).toBe(VIDEO_MAX_BYTES);
    expect(VideoFile.create('video/quicktime', 1).contentType).toBe('video/quicktime');
  });

  it('refuses other formats, empty files and oversized ones', () => {
    expect(reasonOf(() => VideoFile.create('video/webm', 10))).toBe('content-type');
    expect(reasonOf(() => VideoFile.create('video/mp4', 0))).toBe('empty');
    expect(reasonOf(() => VideoFile.create('video/mp4', 1.5))).toBe('empty');
    expect(reasonOf(() => VideoFile.create('video/mp4', VIDEO_MAX_BYTES + 1))).toBe('too-large');
  });
});
