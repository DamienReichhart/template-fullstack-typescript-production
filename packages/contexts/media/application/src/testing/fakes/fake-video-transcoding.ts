import { VideoTranscoding } from '../../ports/processing/video-transcoding.port.ts';

/** Records the Videos media asked to transcode; transcodes none. */
export class FakeVideoTranscoding extends VideoTranscoding {
  readonly scheduled: string[] = [];

  async schedule(videoId: string): Promise<void> {
    this.scheduled.push(videoId);
  }
}
