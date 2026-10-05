import { Command } from '@nestjs/cqrs';

export interface PurgeResult {
  sessions: number;
  oneTimeTokens: number;
}

/** Housekeeping: deletes sessions and one-time tokens that ended past the retention period. */
export class PurgeExpiredSessionsCommand extends Command<PurgeResult> {}
