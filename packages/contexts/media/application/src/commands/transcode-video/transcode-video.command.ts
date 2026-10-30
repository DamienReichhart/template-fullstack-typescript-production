import { Command } from '@nestjs/cqrs';

/**
 * Transcodes a Processing Video. `lastAttempt` is set by the job when no retry follows: a
 * temporary failure then fails the Video instead of leaving it Processing.
 */
export class TranscodeVideoCommand extends Command<void> {
  constructor(
    readonly videoId: string,
    readonly lastAttempt: boolean,
  ) {
    super();
  }
}
