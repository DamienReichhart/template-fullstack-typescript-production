import { randomUUID } from 'node:crypto';

export interface RegistrationFixture {
  name: string;
  email: string;
  password: string;
  locale: 'en' | 'fr';
}

/** A valid, unique registration payload. Override only what the test is about. */
export function aRegistration(overrides: Partial<RegistrationFixture> = {}): RegistrationFixture {
  const id = randomUUID().slice(0, 8);
  return {
    name: `Test User ${id}`,
    email: `user-${id}@example.com`,
    password: `correct horse battery ${id}`,
    locale: 'en',
    ...overrides,
  };
}
