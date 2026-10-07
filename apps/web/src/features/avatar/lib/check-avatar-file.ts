import { AVATAR_CONTENT_TYPES, AVATAR_MAX_BYTES } from '@template/contracts/identity';

export type AvatarFileProblem =
  'validation.avatar.contentType' | 'validation.avatar.empty' | 'validation.avatar.tooLarge';

/**
 * Refuses a file the api would refuse anyway, before anything is sent. A convenience only:
 * the api and the storage enforce the same rules.
 */
export function checkAvatarFile(file: Pick<File, 'type' | 'size'>): AvatarFileProblem | null {
  if (!(AVATAR_CONTENT_TYPES as readonly string[]).includes(file.type)) {
    return 'validation.avatar.contentType';
  }
  if (file.size === 0) return 'validation.avatar.empty';
  if (file.size > AVATAR_MAX_BYTES) return 'validation.avatar.tooLarge';
  return null;
}

/** A file refused before upload; `problem` is an i18n key of the `validation` namespace. */
export class AvatarFileError extends Error {
  constructor(readonly problem: AvatarFileProblem) {
    super(problem);
    this.name = 'AvatarFileError';
  }
}
