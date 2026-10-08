import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { Clock } from '@template/ddd';
import { UserId, UserNotFoundError, UserRepository } from '@template/identity-domain';

import { RemoveAvatarCommand } from './remove-avatar.command.ts';

@CommandHandler(RemoveAvatarCommand)
export class RemoveAvatarHandler implements ICommandHandler<RemoveAvatarCommand, void> {
  constructor(
    private readonly users: UserRepository,
    private readonly clock: Clock,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ userId }: RemoveAvatarCommand): Promise<void> {
    const user = await this.users.findById(UserId.from(userId));
    if (!user) throw new UserNotFoundError(userId);

    user.changeAvatar(null, this.clock.now());
    await this.users.save(user);
    this.eventBus.publishAll(user.pullDomainEvents());
  }
}
