import { describe, expect, it } from 'bun:test';

import { buildMetadata } from './build-metadata';

describe('buildMetadata', () => {
  it('declares the canonical URL and an alternate per locale', () => {
    const metadata = buildMetadata({
      locale: 'fr',
      path: '/login',
      title: 'Connexion',
      description: 'd',
    });

    expect(metadata.alternates?.canonical).toBe('http://web.test/fr/login');
    expect(metadata.alternates?.languages).toEqual({
      en: 'http://web.test/en/login',
      fr: 'http://web.test/fr/login',
      'x-default': 'http://web.test/en/login',
    });
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });

  it('maps the home page to the bare locale URL', () => {
    expect(
      buildMetadata({ locale: 'en', path: '/', title: 't', description: 'd' }).alternates
        ?.canonical,
    ).toBe('http://web.test/en');
  });

  it('keeps private pages out of search engines', () => {
    expect(
      buildMetadata({
        locale: 'en',
        path: '/dashboard',
        title: 't',
        description: 'd',
        noIndex: true,
      }).robots,
    ).toEqual({
      index: false,
      follow: false,
    });
  });
});
