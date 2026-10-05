import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Email, InvalidCredentialsError, UserRepository } from '@template/identity-domain';

import { PasswordHasher } from '../../ports/security/password-hasher.port.ts';
import { SessionIssuer } from '../../services/session-issuer.service.ts';
import type { AuthSessionView } from '../../views/auth-session.view.ts';
import { LoginCommand } from './login.command.ts';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, AuthSessionView> {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly sessionIssuer: SessionIssuer,
  ) {}

  async execute({ email, password, client }: LoginCommand): Promise<AuthSessionView> {
    const user = await this.users.findByEmail(Email.create(email));
    if (!user) {
      // Spend the same time as a real check so response times do not reveal which emails exist.
      await this.hasher.hash(password);
      throw new InvalidCredentialsError();
    }
    if (!(await this.hasher.verify(user.passwordHash.value, password)))
      throw new InvalidCredentialsError();
    return this.sessionIssuer.open(user, client);
  }
}
