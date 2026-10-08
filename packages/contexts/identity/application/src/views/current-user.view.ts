import type { User, UserRole } from '@template/identity-domain';

export interface CurrentUserView {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  locale: string;
  emailVerified: boolean;
  /** Where the browser displays the Avatar from; `null` when the User has none. */
  avatarUrl: string | null;
  createdAt: Date;
}

/** Prefer `CurrentUserViews.of(user)`, which resolves the avatar URL. */
export function toCurrentUserView(user: User, avatarUrl: string | null): CurrentUserView {
  return {
    id: user.id.value,
    email: user.email.value,
    name: user.name,
    role: user.role,
    locale: user.locale,
    emailVerified: user.isEmailVerified,
    avatarUrl,
    createdAt: user.createdAt,
  };
}
