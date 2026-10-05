import type { User, UserRole } from '@template/identity-domain';

export interface CurrentUserView {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  locale: string;
  emailVerified: boolean;
  createdAt: Date;
}

export function toCurrentUserView(user: User): CurrentUserView {
  return {
    id: user.id.value,
    email: user.email.value,
    name: user.name,
    role: user.role,
    locale: user.locale,
    emailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  };
}
