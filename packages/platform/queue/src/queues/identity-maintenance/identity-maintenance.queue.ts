import { defineQueue } from '../../core/define-queue.js';

/** Housekeeping of the identity context (expired sessions and tokens). */
export const identityMaintenanceQueue = defineQueue('identity-maintenance');
