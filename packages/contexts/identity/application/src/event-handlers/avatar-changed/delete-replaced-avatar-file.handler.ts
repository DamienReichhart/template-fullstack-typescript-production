import { Logger } from '@nestjs/common';
import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { AvatarChangedEvent } from '@template/identity-domain';

import { IdentityHousekeeping } from '../../ports/maintenance/identity-housekeeping.port.ts';

/**
 * Policy: once a User's Avatar changed, the file of the previous one goes. Through a job, so a
 * storage hiccup is retried instead of failing the change; a failure to enqueue only leaves
 * an orphaned file, never a broken Avatar.
 */
@EventsHandler(AvatarChangedEvent)
export class DeleteReplacedAvatarFileHandler implements IEventHandler<AvatarChangedEvent> {
  private readonly logger = new Logger(DeleteReplacedAvatarFileHandler.name);

  constructor(private readonly housekeeping: IdentityHousekeeping) {}

  async handle({ userId, previousAvatarKey }: AvatarChangedEvent): Promise<void> {
    if (!previousAvatarKey) return;
    try {
      await this.housekeeping.deleteAvatarFile(previousAvatarKey);
    } catch (error) {
      this.logger.error(
        { err: error, userId, previousAvatarKey },
        'Could not schedule avatar deletion',
      );
    }
  }
}
