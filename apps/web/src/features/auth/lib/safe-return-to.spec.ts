import { describe, expect, it } from 'bun:test';

import { safeReturnTo } from './safe-return-to';

const locales = ['en', 'fr'];

describe('safeReturnTo', () => {
  it('keeps an app path and strips its locale', () => {
    expect(safeReturnTo('/fr/dashboard', locales)).toBe('/dashboard');
    expect(safeReturnTo('/dashboard?tab=1', locales)).toBe('/dashboard?tab=1');
  });

  it('rejects anything that could leave the site', () => {
    for (const unsafe of [
      'https://evil.test',
      '//evil.test',
      '/\\evil.test',
      'javascript:alert(1)',
    ]) {
      expect(safeReturnTo(unsafe, locales)).toBe('/dashboard');
    }
  });

  it('falls back to the dashboard when missing', () => {
    expect(safeReturnTo(null, locales)).toBe('/dashboard');
    expect(safeReturnTo('/en', locales)).toBe('/dashboard');
  });
});
