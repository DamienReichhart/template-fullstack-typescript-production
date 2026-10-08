import { uploadToStorage } from '@template/api-client';

import { api } from '@/shared/api/api-client';

import { AvatarFileError, checkAvatarFile } from '../lib/check-avatar-file';

/** Mutation functions of the avatar feature; hooks add cache updates. */
export const avatarMutations = {
  /** Announce the file, send it straight to storage, then make it the avatar. */
  change: async (file: File) => {
    const problem = checkAvatarFile(file);
    if (problem) throw new AvatarFileError(problem);
    const ticket = await api.identity.requestAvatarUpload({
      contentType: file.type as never,
      size: file.size,
    });
    await uploadToStorage(ticket, file);
    return api.identity.changeAvatar({ uploadId: ticket.uploadId });
  },
  remove: () => api.identity.removeAvatar(),
};
