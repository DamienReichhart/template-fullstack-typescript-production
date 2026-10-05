import { describe, expect, it } from 'bun:test';

import { ReactEmailRenderer } from './react-email.renderer.js';

const renderer = new ReactEmailRenderer();
const url = 'https://app.test/fr/verify-email?token=abc';

describe('ReactEmailRenderer', () => {
  it('renders the verification email in the recipient language, in HTML and plain text', async () => {
    const email = await renderer.render({
      kind: 'verify-email',
      locale: 'fr',
      name: 'Ada',
      verificationUrl: url,
      expiresInHours: 24,
    });

    expect(email.subject).toBe('Vérifiez votre adresse e-mail');
    expect(email.html).toContain('lang="fr"');
    expect(email.html).toContain(url);
    expect(email.text).toContain(url);
    expect(email.text).toContain('24 heures');
  });

  it('interpolates every placeholder', async () => {
    const email = await renderer.render({
      kind: 'welcome',
      locale: 'en',
      name: 'Ada',
      appUrl: 'https://app.test/en',
    });
    expect(email.subject).toBe('Welcome to Template');
    expect(email.text.toLowerCase()).toContain('welcome, ada!');
    expect(email.html).not.toMatch(/\{\w+\}/);
  });

  it('falls back to the default language for unsupported locales', async () => {
    const email = await renderer.render({
      kind: 'reset-password',
      locale: 'xx',
      name: 'Ada',
      resetUrl: 'https://app.test/en/reset-password?token=t',
      expiresInMinutes: 60,
    });
    expect(email.subject).toBe('Reset your password');
  });
});
