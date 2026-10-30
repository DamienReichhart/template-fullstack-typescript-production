/** Where a Video is in its life: being transcoded, playable, or given up on. */
export const VideoStatuses = ['PROCESSING', 'READY', 'FAILED'] as const;

export type VideoStatus = (typeof VideoStatuses)[number];

export const isVideoStatus = (value: string): value is VideoStatus =>
  (VideoStatuses as readonly string[]).includes(value);
