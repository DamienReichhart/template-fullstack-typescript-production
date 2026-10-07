import { describe, expect, it, mock } from 'bun:test';

import { ApiError } from './api-error.ts';
import { uploadToStorage } from './storage-upload.ts';

const ticket = {
  url: 'https://files.example.com/bucket',
  fields: { key: 'staging/x', 'Content-Type': 'image/png', Policy: 'p' },
};

describe('uploadToStorage', () => {
  it('posts the signed fields then the file, without credentials', async () => {
    const fetch = mock(
      async (_url: string, _init?: RequestInit) => new Response(null, { status: 204 }),
    );

    await uploadToStorage(ticket, new Blob(['png']), { fetch });

    const [url, init] = fetch.mock.calls[0] ?? [];
    expect(url).toBe(ticket.url);
    expect(init?.credentials).toBe('omit');
    const form = init?.body as FormData;
    expect([...form.keys()]).toEqual(['key', 'Content-Type', 'Policy', 'file']);
  });

  it('turns a storage refusal into UPLOAD_FAILED and a network failure into NETWORK_ERROR', async () => {
    const refused = uploadToStorage(ticket, new Blob(['x']), {
      fetch: async () =>
        new Response('<Error><Code>EntityTooLarge</Code></Error>', { status: 400 }),
    });
    await expect(refused).rejects.toMatchObject({ status: 400, code: 'UPLOAD_FAILED' });

    const offline = uploadToStorage(ticket, new Blob(['x']), {
      fetch: async () => {
        throw new TypeError('Failed to fetch');
      },
    });
    await expect(offline).rejects.toBeInstanceOf(ApiError);
    await expect(offline).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  });
});
