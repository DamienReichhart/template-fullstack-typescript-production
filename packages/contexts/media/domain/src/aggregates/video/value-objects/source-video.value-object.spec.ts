import { describe, expect, it } from 'bun:test';

import type { RejectedVideoError } from '../errors/rejected-video.error.ts';
import { SourceVideo, VIDEO_MAX_DURATION_SECONDS } from './source-video.value-object.ts';

const reasonOf = (source: SourceVideo) => {
  try {
    source.assertAcceptable();
  } catch (error) {
    return (error as RejectedVideoError).reason;
  }
  return undefined;
};

describe('SourceVideo', () => {
  it('accepts a video of at most ten minutes', () => {
    expect(
      reasonOf(
        SourceVideo.of({ hasVideoStream: true, durationSeconds: VIDEO_MAX_DURATION_SECONDS }),
      ),
    ).toBeUndefined();
  });

  it('rejects a file without video, and a video too long', () => {
    expect(reasonOf(SourceVideo.of({ hasVideoStream: false, durationSeconds: 3 }))).toBe(
      'unreadable',
    );
    expect(
      reasonOf(
        SourceVideo.of({ hasVideoStream: true, durationSeconds: VIDEO_MAX_DURATION_SECONDS + 1 }),
      ),
    ).toBe('too-long');
  });
});
