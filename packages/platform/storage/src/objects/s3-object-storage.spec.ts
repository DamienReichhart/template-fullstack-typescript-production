import { describe, expect, it } from 'bun:test';

import { createS3Clients } from '../client/create-s3-clients.ts';
import { S3ObjectStorage } from './s3-object-storage.ts';

// Presigning is local computation: no storage needs to run for these tests.
const clients = createS3Clients({
  S3_ENDPOINT: 'http://rustfs:9000',
  S3_PUBLIC_ENDPOINT: 'https://files.example.com',
  S3_REGION: 'us-east-1',
  S3_ACCESS_KEY_ID: 'key',
  S3_SECRET_ACCESS_KEY: 'secret',
  S3_FORCE_PATH_STYLE: true,
  S3_BUCKET: 'bucket',
});
const at = (iso: string) => new S3ObjectStorage(clients, 'bucket', () => new Date(iso));

describe('S3ObjectStorage presigning', () => {
  it('signs URLs for the public endpoint, not the internal one', async () => {
    const { url } = await at('2026-01-01T10:00:00Z').presignDownload('a/b.png');
    expect(url.startsWith('https://files.example.com/bucket/a/b.png?')).toBe(true);

    const upload = await at('2026-01-01T10:00:00Z').presignUpload('staging/x', {
      contentType: 'image/png',
      maxBytes: 10,
    });
    expect(upload.url).toBe('https://files.example.com/bucket');
    expect(upload.fields).toMatchObject({ key: 'staging/x', 'Content-Type': 'image/png' });
  });

  it('returns the same stable URL within a window, and a new one in the next', async () => {
    const options = { expiresInSeconds: 3600, stable: true };
    const first = await at('2026-01-01T10:05:00Z').presignDownload('a/b.png', options);
    const sameWindow = await at('2026-01-01T10:55:00Z').presignDownload('a/b.png', options);
    const nextWindow = await at('2026-01-01T11:01:00Z').presignDownload('a/b.png', options);

    expect(sameWindow.url).toBe(first.url);
    expect(nextWindow.url).not.toBe(first.url);
    expect(first.expiresAt.toISOString()).toBe('2026-01-01T12:00:00.000Z');
  });

  it('signs a fresh URL on every call by default', async () => {
    const first = await at('2026-01-01T10:05:00Z').presignDownload('a/b.png');
    const later = await at('2026-01-01T10:05:01Z').presignDownload('a/b.png');
    expect(later.url).not.toBe(first.url);
  });

  it('names downloads safely', async () => {
    const { url } = await at('2026-01-01T10:00:00Z').presignDownload('a/b.pdf', {
      downloadAs: 'Q3 "report".pdf',
    });
    const disposition = new URL(url).searchParams.get('response-content-disposition');
    expect(disposition).toContain('filename="Q3 _report_.pdf"');
  });
});
