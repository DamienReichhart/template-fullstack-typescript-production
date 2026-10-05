import { describe, expect, it } from 'bun:test';
import { z } from 'zod';

import { defineConfig } from './config-definition.js';
import { EnvValidationError, loadConfig } from './load-env.js';

const portConfig = defineConfig('port', z.object({ PORT: z.coerce.number().int().positive() }));
const urlConfig = defineConfig('url', z.object({ PUBLIC_URL: z.url() }));

describe('loadConfig', () => {
  it('returns typed values keyed by definition', () => {
    const config = loadConfig([portConfig, urlConfig], {
      PORT: '4000',
      PUBLIC_URL: 'http://localhost:4000',
    });
    expect(config.port.PORT).toBe(4000);
    expect(config.url.PUBLIC_URL).toBe('http://localhost:4000');
  });

  it('reports every invalid variable of every definition in one error', () => {
    try {
      loadConfig([portConfig, urlConfig], { PORT: 'abc' });
      throw new Error('expected loadConfig to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);
      const { issues } = error as EnvValidationError;
      expect(issues.map((issue) => issue.variable)).toEqual(['PORT', 'PUBLIC_URL']);
      expect((error as Error).message).toContain('2 issues');
    }
  });
});
