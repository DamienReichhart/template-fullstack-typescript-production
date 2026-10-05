import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { addDays, Clock } from '@template/ddd';
import { OneTimeTokenRepository, SessionRepository } from '@template/identity-domain';

import { PurgeExpiredSessionsCommand, type PurgeResult } from './purge-expired-sessions.command.ts';

/** Ended sessions stay this long for support and audit questions ("where was I signed in?"). */
export const ENDED_SESSION_RETENTION_DAYS = 7;

@CommandHandler(PurgeExpiredSessionsCommand)
export class PurgeExpiredSessionsHandler implements ICommandHandler<
  PurgeExpiredSessionsCommand,
  PurgeResult
> {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly tokens: OneTimeTokenRepository,
    private readonly clock: Clock,
  ) {}

  async execute(_command: PurgeExpiredSessionsCommand): Promise<PurgeResult> {
    const cutoff = addDays(this.clock.now(), -ENDED_SESSION_RETENTION_DAYS);
    return {
      sessions: await this.sessions.deleteEndedBefore(cutoff),
      oneTimeTokens: await this.tokens.deleteEndedBefore(cutoff),
    };
  }
}
