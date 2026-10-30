import { uploadToStorage } from '@template/api-client';

import { api } from '@/shared/api/api-client';

import { checkVideoFile, VideoFileError } from '../lib/check-video-file';

/** Mutation functions of the videos feature; hooks add cache updates. */
export const videoMutations = {
  /** Announce the file, send it straight to storage, then turn it into a video. */
  upload: async (file: File) => {
    const problem = checkVideoFile(file);
    if (problem) throw new VideoFileError(problem);
    const ticket = await api.media.requestVideoUpload({
      contentType: file.type as never,
      size: file.size,
    });
    await uploadToStorage(ticket, file);
    return api.media.uploadVideo({ uploadId: ticket.uploadId });
  },
};
