import type { CurrentUserView } from './current-user.view.js';

/** Everything the transport needs to sign a client in: who, and the two tokens. */
export interface AuthSessionView {
  user: CurrentUserView;
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}
