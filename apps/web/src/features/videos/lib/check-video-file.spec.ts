import { describe, expect, it } from 'bun:test';
import { VIDEO_MAX_BYTES } from '@template/contracts/media';

import { checkVideoFile } from './check-video-file';

describe('checkVideoFile', () => {
  it('accepts MP4 and MOV videos up to the size limit', () => {
    expect(checkVideoFile({ type: 'video/mp4', size: VIDEO_MAX_BYTES })).toBeNull();
    expect(checkVideoFile({ type: 'video/quicktime', size: 1 })).toBeNull();
  });

  it('names what is wrong with any other file', () => {
    expect(checkVideoFile({ type: 'video/webm', size: 1 })).toBe('validation.video.contentType');
    expect(checkVideoFile({ type: 'video/mp4', size: 0 })).toBe('validation.video.empty');
    expect(checkVideoFile({ type: 'video/mp4', size: VIDEO_MAX_BYTES + 1 })).toBe(
      'validation.video.tooLarge',
    );
  });
});
