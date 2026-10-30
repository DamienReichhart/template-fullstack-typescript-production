/**
 * Hands Transcoding to the worker (the `media` queue): it takes minutes, and is retried there
 * instead of failing the upload.
 */
export abstract class VideoTranscoding {
  /** Idempotent: a Video already waiting is not queued twice. */
  abstract schedule(videoId: string): Promise<void>;
}
