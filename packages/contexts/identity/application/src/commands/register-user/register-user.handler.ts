import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { Clock, UnitOfWork } from '@template/ddd';
import {
  Email,
  EmailAlreadyTakenError,
  PasswordHash,
  User,
  UserRepository,
} from '@template/identity-domain';

import { PasswordHasher } from '../../ports/security/password-hasher.port.ts';
import { SessionIssuer } from '../../services/session-issuer.service.ts';
import type { AuthSessionView } from '../../views/auth-session.view.ts';
import { RegisterUserCommand } from './register-user.command.ts';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand, AuthSessionView> {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly sessionIssuer: SessionIssuer,
    private readonly unitOfWork: UnitOfWork,
    private readonly clock: Clock,
    private readonly eventBus: EventBus,
  ) {}

  async execute({
    name,
    email,
    password,
    locale,
    client,
  }: RegisterUserCommand): Promise<AuthSessionView> {
    const address = Email.create(email);
    if (await this.users.existsByEmail(address)) throw new EmailAlreadyTakenError();

    const user = User.register({
      email: address,
      name,
      passwordHash: PasswordHash.fromHash(await this.hasher.hash(password)),
      locale,
      now: this.clock.now(),
    });

    const session = await this.unitOfWork.run(async () => {
      await this.users.save(user);
      return this.sessionIssuer.open(user, client);
    });
    this.eventBus.publishAll(user.pullDomainEvents());
    return session;
  }
}
