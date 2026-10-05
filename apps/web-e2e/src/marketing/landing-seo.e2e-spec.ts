import { expect, test } from '../support/fixtures.ts';
import { en, fr } from '../support/messages.ts';

test.describe('landing page', () => {
  test('redirects to the default locale', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
  });

  test.describe('for a French browser', () => {
    test.use({ locale: 'fr-FR' });

    test('negotiates French', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/\/fr$/);
      await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
      await expect(page).toHaveTitle(new RegExp(fr.seo.pages.landing.title));
    });
  });

  test('ships the metadata search engines read', async ({ page }) => {
    await page.goto('/en');
    const head = page.locator('head');

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(head.locator('link[rel=canonical]')).toHaveAttribute('href', /\/en$/);
    for (const [hreflang, path] of [
      ['en', '/en'],
      ['fr', '/fr'],
      ['x-default', '/en'],
    ]) {
      await expect(head.locator(`link[rel=alternate][hreflang="${hreflang}"]`)).toHaveAttribute(
        'href',
        new RegExp(`${path}$`),
      );
    }
    await expect(head.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en');
    await expect(head.locator('meta[property="og:image"]').first()).toHaveAttribute(
      'content',
      /opengraph-image/,
    );

    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(JSON.parse(jsonLd ?? '{}')).toMatchObject({ '@context': 'https://schema.org' });
  });

  test('switches language on the same page', async ({ page }) => {
    await page.goto('/en/login');
    await page.getByLabel(en.common.localeSwitcher.label).selectOption('fr');
    await expect(page).toHaveURL(/\/fr\/login$/);
    await expect(page.getByRole('heading', { name: fr.auth.login.title })).toBeVisible();
  });

  test('keeps private and token pages out of the index', async ({ page, request }) => {
    await page.goto('/en/verify-email?token=x');
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);

    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain('Disallow: /*/dashboard');
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).toContain('/fr</loc>');
    expect(sitemap).not.toContain('dashboard');
  });
});
