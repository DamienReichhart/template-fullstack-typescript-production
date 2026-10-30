export const MediaErrorCode = {
  videoInvalid: 'VIDEO_INVALID',
  videoUploadNotFound: 'VIDEO_UPLOAD_NOT_FOUND',
  videoNotFound: 'VIDEO_NOT_FOUND',
} as const;

export type MediaErrorCode = (typeof MediaErrorCode)[keyof typeof MediaErrorCode];
