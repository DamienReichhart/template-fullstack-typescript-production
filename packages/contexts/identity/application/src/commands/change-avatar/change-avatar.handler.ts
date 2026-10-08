import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { Clock } from '@template/ddd';
import { UserId, UserNotFoundError, UserRepository } from '@template/identity-domain';

import { AvatarStorage } from '../../ports/storage/avatar-storage.port.ts';
import { ChangeAvatarCommand } from './change-avatar.command.ts';

/**
 * Keeps the uploaded file (checked by the storage adapter), then points the User at it.
 * The replaced file is deleted by a job, through `AvatarChanged`.
 */
@CommandHandler(ChangeAvatarCommand)
export class ChangeAvatarHandler implements ICommandHandler<ChangeAvatarCommand, void> {
  constructor(
    private readonly users: UserRepository,
    private readonly avatars: AvatarStorage,
    private readonly clock: Clock,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ userId, uploadId }: ChangeAvatarCommand): Promise<void> {
    const user = await this.users.findById(UserId.from(userId));
    if (!user) throw new UserNotFoundError(userId);

    const avatarKey = await this.avatars.keep(userId, uploadId);
    user.changeAvatar(avatarKey, this.clock.now());
    await this.users.save(user);
    this.eventBus.publishAll(user.pullDomainEvents());
  }
}
