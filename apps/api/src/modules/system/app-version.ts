import { readFileSync } from 'node:fs';

/** Version of the api package, read once at boot (works from `src/` and from `dist/`). */
export const APP_VERSION: string = (
  JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8')) as {
    version: string;
  }
).version;
