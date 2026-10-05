import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { Clock } from '@template/ddd';
import { Email, UserRepository } from '@template/identity-domain';

import { RequestPasswordResetCommand } from './request-password-reset.command.ts';

@CommandHandler(RequestPasswordResetCommand)
export class RequestPasswordResetHandler implements ICommandHandler<
  RequestPasswordResetCommand,
  void
> {
  constructor(
    private readonly users: UserRepository,
    private readonly clock: Clock,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ email }: RequestPasswordResetCommand): Promise<void> {
    const user = await this.users.findByEmail(Email.create(email));
    if (!user) return;
    user.requestPasswordReset(this.clock.now());
    this.eventBus.publishAll(user.pullDomainEvents());
  }
}
