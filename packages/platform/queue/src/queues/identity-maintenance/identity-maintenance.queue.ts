import { defineQueue } from '../../core/define-queue.ts';

/** Housekeeping of the identity context (expired sessions and tokens). */
export const identityMaintenanceQueue = defineQueue('identity-maintenance');
