/**
 * Why a Video Failed: its Source holds no video the system can read, it lasts longer than
 * a Video may, or Transcoding kept failing for another reason.
 */
export const VideoFailureReasons = ['unreadable', 'too-long', 'processing-failed'] as const;

export type VideoFailureReason = (typeof VideoFailureReasons)[number];

export const isVideoFailureReason = (value: string): value is VideoFailureReason =>
  (VideoFailureReasons as readonly string[]).includes(value);
