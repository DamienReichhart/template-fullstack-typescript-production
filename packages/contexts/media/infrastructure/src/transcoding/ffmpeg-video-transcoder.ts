import { createReadStream, createWriteStream } from 'node:fs';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';

import { Inject, Injectable } from '@nestjs/common';
import { VideoTranscoder } from '@template/media-application';
import { PlayableFile, RejectedVideoError, SourceVideo } from '@template/media-domain';
import { ObjectStorage } from '@template/storage';

import type { MediaConfig } from '../config/media.config.ts';
import { mediaConfig } from '../config/media-env.schema.ts';
import { playableFileArguments, probeArguments } from './ffmpeg-arguments.ts';
import { parseProbeReport, type ProbeReport } from './ffprobe-report.ts';
import { ProcessExitError, runProcess } from './run-process.ts';

/** A Playable file is never rewritten under its key: whatever caches it may keep it. */
const IMMUTABLE = 'private, max-age=31536000, immutable';

/**
 * Transcodes with ffmpeg in a scratch directory of the worker: the Source is downloaded there,
 * probed, encoded, and the result uploaded. The directory is removed whatever happens, so
 * nothing stays on disk ([ADR 0016](../../../../../../docs/adr/0016-the-worker-transcodes-on-scratch-disk.md)).
 */
@Injectable()
export class FfmpegVideoTranscoder extends VideoTranscoder {
  constructor(
    private readonly storage: ObjectStorage,
    @Inject(mediaConfig.token) private readonly config: MediaConfig,
  ) {
    super();
  }

  async transcode(
    sourceKey: string,
    playableKey: string,
    accept: (source: SourceVideo) => void,
  ): Promise<PlayableFile> {
    const directory = await mkdtemp(join(this.config.MEDIA_SCRATCH_DIR, 'transcode-'));
    try {
      const source = join(directory, 'source');
      const playable = join(directory, 'playable.mp4');

      await this.download(sourceKey, source);
      const probe = await this.probeSource(source);
      accept(
        SourceVideo.of({
          hasVideoStream: probe.video !== null,
          durationSeconds: probe.durationSeconds,
        }),
      );

      await runProcess(this.config.FFMPEG_PATH, playableFileArguments(source, playable, probe));
      const result = await this.probe(playable);
      const { size } = await stat(playable);
      await this.storage.put(playableKey, createReadStream(playable), {
        contentType: 'video/mp4',
        cacheControl: IMMUTABLE,
      });
      return PlayableFile.of({
        key: playableKey,
        size,
        width: result.video?.width ?? 0,
        height: result.video?.height ?? 0,
        durationSeconds: result.durationSeconds,
      });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }

  private async download(key: string, path: string): Promise<void> {
    const object = await this.storage.stream(key);
    // The Source is gone: no retry can bring it back.
    if (!object) throw new RejectedVideoError('unreadable');
    await pipeline(
      Readable.fromWeb(object.body as WebReadableStream<Uint8Array>),
      createWriteStream(path),
    );
  }

  /** A file ffprobe cannot read is no video: refused for good, not retried. */
  private async probeSource(path: string): Promise<ProbeReport> {
    try {
      return await this.probe(path);
    } catch (error) {
      if (error instanceof ProcessExitError || error instanceof SyntaxError) {
        throw new RejectedVideoError('unreadable');
      }
      throw error;
    }
  }

  private async probe(path: string): Promise<ProbeReport> {
    return parseProbeReport(await runProcess(this.config.FFPROBE_PATH, probeArguments(path)));
  }
}
