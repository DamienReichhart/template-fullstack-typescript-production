import { defineQueue } from '../../core/define-queue.ts';

/** Work on the media context's files: turning an uploaded Video into its Playable file. */
export const mediaQueue = defineQueue('media');
