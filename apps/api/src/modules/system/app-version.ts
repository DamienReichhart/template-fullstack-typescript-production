import { readFileSync } from 'node:fs';

/**
 * Version of the product, read once at boot from the root package.json, which release-please
 * bumps on each release (works from `src/` and from `dist/`, and in the image).
 */
export const APP_VERSION: string = (
  JSON.parse(readFileSync(new URL('../../../../../package.json', import.meta.url), 'utf8')) as {
    version: string;
  }
).version;
