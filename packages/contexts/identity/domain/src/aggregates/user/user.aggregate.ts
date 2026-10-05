import { AggregateRoot } from '@template/ddd';

import { EmailVerifiedEvent } from './events/email-verified.event.ts';
import { PasswordChangedEvent } from './events/password-changed.event.ts';
import { PasswordResetRequestedEvent } from './events/password-reset-requested.event.ts';
import { UserRegisteredEvent } from './events/user-registered.event.ts';
import type { Email } from './value-objects/email.value-object.ts';
import type { PasswordHash } from './value-objects/password-hash.value-object.ts';
import { UserId } from './value-objects/user-id.value-object.ts';
import type { UserRole } from './value-objects/user-role.value-object.ts';

export interface UserProps {
  email: Email;
  name: string;
  passwordHash: PasswordHash;
  role: UserRole;
  locale: string;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterUserInput {
  email: Email;
  name: string;
  passwordHash: PasswordHash;
  locale: string;
  now: Date;
}

/** Someone who can sign in. Owns its credentials and the state of its email verification. */
export class User extends AggregateRoot<UserId, UserProps> {
  static register({ email, name, passwordHash, locale, now }: RegisterUserInput): User {
    const user = new User(UserId.create(), {
      email,
      name: name.trim(),
      passwordHash,
      role: 'USER',
      locale,
      emailVerifiedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    user.addDomainEvent(
      new UserRegisteredEvent(user.id.value, email.value, user.name, locale, now),
    );
    return user;
  }

  /** Rebuilds a user from storage. Records no event: nothing happened. */
  static reconstitute(id: UserId, props: UserProps): User {
    return new User(id, props);
  }

  get email(): Email {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get passwordHash(): PasswordHash {
    return this.props.passwordHash;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get locale(): string {
    return this.props.locale;
  }

  get emailVerifiedAt(): Date | null {
    return this.props.emailVerifiedAt;
  }

  get isEmailVerified(): boolean {
    return this.props.emailVerifiedAt !== null;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /** Idempotent: verifying an already verified email changes nothing and records nothing. */
  verifyEmail(now: Date): void {
    if (this.isEmailVerified) return;
    this.props.emailVerifiedAt = now;
    this.props.updatedAt = now;
    this.addDomainEvent(new EmailVerifiedEvent(this.id.value, now));
  }

  requestPasswordReset(now: Date): void {
    this.addDomainEvent(new PasswordResetRequestedEvent(this.id.value, now));
  }

  changePassword(passwordHash: PasswordHash, now: Date): void {
    this.props.passwordHash = passwordHash;
    this.props.updatedAt = now;
    this.addDomainEvent(new PasswordChangedEvent(this.id.value, now));
  }
}
