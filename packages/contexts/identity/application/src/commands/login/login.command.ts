import { Command } from '@nestjs/cqrs';

import type { AuthSessionView } from '../../views/auth-session.view.ts';
import type { ClientInfo } from '../../views/client-info.ts';

export class LoginCommand extends Command<AuthSessionView> {
  constructor(
    readonly email: string,
    readonly password: string,
    readonly client: ClientInfo = {},
  ) {
    super();
  }
}
