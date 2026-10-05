import { Command } from '@nestjs/cqrs';

import type { AuthSessionView } from '../../views/auth-session.view.js';
import type { ClientInfo } from '../../views/client-info.js';

/** Creates a user and signs them in on the device that registered. */
export class RegisterUserCommand extends Command<AuthSessionView> {
  constructor(
    readonly name: string,
    readonly email: string,
    readonly password: string,
    readonly locale: string,
    readonly client: ClientInfo = {},
  ) {
    super();
  }
}
