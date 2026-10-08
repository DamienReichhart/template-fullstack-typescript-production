import { describe, expect, it } from 'bun:test';

import { EnvValidationError, loadConfig } from '../loader/load-env.ts';
import { storageConfig } from './storage-env.schema.ts';

const local = {
  S3_ENDPOINT: 'http://localhost:9000',
  S3_ACCESS_KEY_ID: 'template',
  S3_SECRET_ACCESS_KEY: 'template-secret',
  S3_FORCE_PATH_STYLE: 'true',
  S3_BUCKET: 'template',
};

describe('storageConfig', () => {
  it('reads a self-hosted S3 endpoint with static credentials', () => {
    const { storage } = loadConfig([storageConfig], local);
    expect(storage).toEqual({
      S3_ENDPOINT: 'http://localhost:9000',
      S3_PUBLIC_ENDPOINT: undefined,
      S3_REGION: 'us-east-1',
      S3_ACCESS_KEY_ID: 'template',
      S3_SECRET_ACCESS_KEY: 'template-secret',
      S3_FORCE_PATH_STYLE: true,
      S3_BUCKET: 'template',
    });
  });

  it('treats empty endpoints and credentials as unset (AWS defaults)', () => {
    const { storage } = loadConfig([storageConfig], {
      S3_ENDPOINT: '',
      S3_PUBLIC_ENDPOINT: '',
      S3_ACCESS_KEY_ID: '',
      S3_SECRET_ACCESS_KEY: '',
      S3_BUCKET: 'acme-prod-uploads',
    });
    expect(storage.S3_ENDPOINT).toBeUndefined();
    expect(storage.S3_ACCESS_KEY_ID).toBeUndefined();
    expect(storage.S3_FORCE_PATH_STYLE).toBe(false);
  });

  it('rejects half a credential pair and an invalid bucket name', () => {
    expect(() =>
      loadConfig([storageConfig], { ...local, S3_SECRET_ACCESS_KEY: '', S3_BUCKET: 'Bad_Name' }),
    ).toThrow(EnvValidationError);
    try {
      loadConfig([storageConfig], { ...local, S3_SECRET_ACCESS_KEY: '' });
    } catch (error) {
      expect((error as EnvValidationError).issues[0]?.variable).toBe('S3_SECRET_ACCESS_KEY');
    }
  });
});
