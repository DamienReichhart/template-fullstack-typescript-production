import type { PlayableFile, SourceVideo } from '@template/media-domain';

/**
 * Turns a Source into a Playable file: H.264 High at visually lossless quality, 8-bit 4:2:0,
 * SDR BT.709 (HDR is tone mapped), rotation applied, metadata stripped, AAC audio, index first.
 */
export abstract class VideoTranscoder {
  /**
   * Reads the Source at `sourceKey`, shows what it holds to `accept` before any encoding (which
   * throws to refuse it), then stores the Playable file at `playableKey`. Throws
   * `RejectedVideoError` when the Source cannot be read as a video; any other error may be
   * temporary. Leaves nothing behind but the Playable file, whatever happens.
   */
  abstract transcode(
    sourceKey: string,
    playableKey: string,
    accept: (source: SourceVideo) => void,
  ): Promise<PlayableFile>;
}
