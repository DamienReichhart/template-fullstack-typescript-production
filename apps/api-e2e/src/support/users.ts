import { SQL } from 'bun';

import { apiPath } from '@template/contracts/common';
import { IdentityRoutes, type CurrentUserResponse } from '@template/contracts/identity';

import { ApiSession } from './api-session.ts';
import { e2eEnv } from './env.ts';
import { tokenFromEmail } from './mail-outbox.ts';

const auth = IdentityRoutes.auth;
export const authPath = (route: string) => apiPath(auth.controller, route);
export const mePath = apiPath(IdentityRoutes.me.controller);

export const PASSWORD = 'correct-horse-battery-staple';

/** Unique per call, so suites never collide and never need a database reset. */
export function uniqueEmail(label = 'user'): string {
  return `e2e-${label}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}@example.com`;
}

export interface TestUser {
  session: ApiSession;
  email: string;
  password: string;
  user: CurrentUserResponse;
}

/** Registers through the public API; the session is signed in, the email unverified. */
export async function registerUser(
  options: { locale?: 'en' | 'fr'; label?: string } = {},
): Promise<TestUser> {
  const session = new ApiSession();
  const email = uniqueEmail(options.label);
  const response = await session.post<CurrentUserResponse>(authPath(auth.register), {
    name: 'E2E User',
    email,
    password: PASSWORD,
    locale: options.locale ?? 'en',
  });
  if (response.status !== 201) {
    throw new Error(`register failed: ${response.status} ${JSON.stringify(response.body)}`);
  }
  return { session, email, password: PASSWORD, user: response.body };
}

/**
 * A registered user who followed the emailed verification link. Like the web client, it
 * refreshes the session afterwards: the access token carries the verification as a claim,
 * and the link may well have been opened in another browser than the session's.
 */
export async function verifiedUser(): Promise<TestUser> {
  const user = await registerUser({ label: 'verified' });
  const token = await tokenFromEmail(user.email, 'verify-email', '/verify-email');
  const verified = await user.session.post(authPath(auth.verifyEmail), { token });
  if (verified.status !== 204) throw new Error(`verify-email failed: ${verified.status}`);
  const refreshed = await user.session.post(authPath(auth.refresh));
  if (refreshed.status !== 200) throw new Error(`refresh failed: ${refreshed.status}`);
  return { ...user, user: refreshed.body as TestUser['user'] };
}

/**
 * Promotes a user to ADMIN directly in the database: there is no API for it by design.
 * The role is a JWT claim, so the caller signs in again afterwards.
 */
export async function promoteToAdmin(email: string): Promise<void> {
  const sql = new SQL(e2eEnv.databaseUrl);
  try {
    await sql`UPDATE users SET role = 'ADMIN' WHERE email = ${email}`;
  } finally {
    await sql.close();
  }
}
