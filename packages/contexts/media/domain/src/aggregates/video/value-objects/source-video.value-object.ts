import { ValueObject } from '@template/ddd';

import { RejectedVideoError } from '../errors/rejected-video.error.ts';

/** Longest Video a User may upload: ten minutes. */
export const VIDEO_MAX_DURATION_SECONDS = 10 * 60;

export interface SourceVideoProps {
  /** False when the file holds no video stream at all (an audio file, a still image). */
  hasVideoStream: boolean;
  durationSeconds: number;
}

/** What a Source turned out to hold, read before Transcoding starts. */
export class SourceVideo extends ValueObject<SourceVideoProps> {
  static of(props: SourceVideoProps): SourceVideo {
    return new SourceVideo(props);
  }

  get hasVideoStream(): boolean {
    return this.props.hasVideoStream;
  }

  get durationSeconds(): number {
    return this.props.durationSeconds;
  }

  /** Throws `RejectedVideoError` when this Source may not become a Video. */
  assertAcceptable(): void {
    if (!this.props.hasVideoStream) throw new RejectedVideoError('unreadable');
    if (this.props.durationSeconds > VIDEO_MAX_DURATION_SECONDS) {
      throw new RejectedVideoError('too-long');
    }
  }
}
