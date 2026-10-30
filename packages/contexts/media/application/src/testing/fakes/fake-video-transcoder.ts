import { PlayableFile, SourceVideo } from '@template/media-domain';

import { VideoTranscoder } from '../../ports/transcoding/video-transcoder.port.ts';
import type { FakeVideoStorage } from './fake-video-storage.ts';

/**
 * Transcodes nothing: shows `source` to `accept`, then adds the Playable file to `storage`.
 * Set `failWith` to make the next calls throw.
 */
export class FakeVideoTranscoder extends VideoTranscoder {
  source = SourceVideo.of({ hasVideoStream: true, durationSeconds: 12.5 });
  failWith: Error | null = null;
  readonly calls: { sourceKey: string; playableKey: string }[] = [];

  constructor(private readonly storage: FakeVideoStorage) {
    super();
  }

  async transcode(
    sourceKey: string,
    playableKey: string,
    accept: (source: SourceVideo) => void,
  ): Promise<PlayableFile> {
    this.calls.push({ sourceKey, playableKey });
    accept(this.source);
    this.storage.files.add(playableKey);
    if (this.failWith) throw this.failWith;
    return PlayableFile.of({
      key: playableKey,
      size: 4096,
      width: 1920,
      height: 1080,
      durationSeconds: this.source.durationSeconds,
    });
  }
}
