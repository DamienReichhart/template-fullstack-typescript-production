import { Command } from '@nestjs/cqrs';

import type { AuthSessionView } from '../../views/auth-session.view.ts';

/** Trades a refresh token for a new access token and a rotated refresh token. */
export class RefreshSessionCommand extends Command<AuthSessionView> {
  constructor(readonly refreshToken: string) {
    super();
  }
}
