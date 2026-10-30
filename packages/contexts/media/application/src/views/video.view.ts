import type { Video, VideoFailureReason, VideoStatus } from '@template/media-domain';

export interface VideoView {
  id: string;
  status: VideoStatus;
  /** Why the Video Failed; `null` unless it did. */
  failureReason: VideoFailureReason | null;
  /** Where the browser plays the Video from; `null` until it is Ready. */
  url: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  createdAt: Date;
}

/** Prefer `VideoViews.of(video)`, which resolves the URL. */
export function toVideoView(video: Video, url: string | null): VideoView {
  const file = video.playableFile;
  return {
    id: video.id.value,
    status: video.status,
    failureReason: video.failureReason,
    url,
    width: file?.width ?? null,
    height: file?.height ?? null,
    durationSeconds: file?.durationSeconds ?? null,
    createdAt: video.createdAt,
  };
}
