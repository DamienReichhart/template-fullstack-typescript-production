import { VIDEO_CONTENT_TYPES, VIDEO_MAX_BYTES } from '@template/contracts/media';

export type VideoFileProblem =
  'validation.video.contentType' | 'validation.video.empty' | 'validation.video.tooLarge';

/**
 * Refuses a file the api would refuse anyway, before anything is sent. A convenience only:
 * the api and the storage enforce the same rules.
 */
export function checkVideoFile(file: Pick<File, 'type' | 'size'>): VideoFileProblem | null {
  if (!(VIDEO_CONTENT_TYPES as readonly string[]).includes(file.type)) {
    return 'validation.video.contentType';
  }
  if (file.size === 0) return 'validation.video.empty';
  if (file.size > VIDEO_MAX_BYTES) return 'validation.video.tooLarge';
  return null;
}

/** A file refused before upload; `problem` is an i18n key of the `validation` namespace. */
export class VideoFileError extends Error {
  constructor(readonly problem: VideoFileProblem) {
    super(problem);
    this.name = 'VideoFileError';
  }
}
