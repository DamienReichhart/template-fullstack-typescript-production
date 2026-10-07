import { afterAll, beforeEach, describe, expect, it } from 'bun:test';

import { createStorageTestContext, postPresignedForm } from '../testing/storage-test-context.ts';

const context = createStorageTestContext();
const { storage } = context;

beforeEach(async () => {
  await context.reset();
});

afterAll(() => {
  context.close();
});

describe('S3ObjectStorage against RustFS', () => {
  it('writes, describes, reads ranges of and streams an object', async () => {
    await storage.put('docs/hello.txt', 'hello, storage', {
      contentType: 'text/plain',
      cacheControl: 'no-cache',
      metadata: { owner: 'u1' },
    });

    expect(await storage.head('docs/hello.txt')).toMatchObject({
      key: 'docs/hello.txt',
      size: 14,
      contentType: 'text/plain',
      cacheControl: 'no-cache',
      metadata: { owner: 'u1' },
    });
    const range = await storage.read('docs/hello.txt', { start: 0, end: 4 });
    expect(new TextDecoder().decode(range ?? new Uint8Array())).toBe('hello');
    const streamed = await storage.stream('docs/hello.txt');
    expect(await new Response(streamed?.body).text()).toBe('hello, storage');
  });

  it('answers null for missing objects and deletes idempotently', async () => {
    expect(await storage.head('missing/key')).toBeNull();
    expect(await storage.read('missing/key')).toBeNull();
    expect(await storage.stream('missing/key')).toBeNull();
    expect(await storage.exists('missing/key')).toBe(false);
    await storage.delete('missing/key');
    await storage.deleteMany(['missing/a', 'missing/b']);
  });

  it('streams bodies of unknown length (multipart above 5 MiB)', async () => {
    const chunk = new Uint8Array(1024 * 1024).fill(7);
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        for (let i = 0; i < 6; i++) controller.enqueue(chunk);
        controller.close();
      },
    });
    await storage.put('big/blob.bin', body, { contentType: 'application/octet-stream' });
    expect((await storage.head('big/blob.bin'))?.size).toBe(6 * 1024 * 1024);
  });

  it('copies with replaced headers, lists by page and deletes a prefix', async () => {
    await storage.put('src/a.txt', 'a', { contentType: 'text/plain' });
    await storage.copy('src/a.txt', 'dst/a.txt', {
      contentType: 'text/markdown',
      cacheControl: 'private, max-age=60',
    });
    expect(await storage.head('dst/a.txt')).toMatchObject({
      contentType: 'text/markdown',
      cacheControl: 'private, max-age=60',
    });

    for (const name of ['1', '2', '3']) {
      await storage.put(`list/${name}.txt`, name, { contentType: 'text/plain' });
    }
    const first = await storage.list({ prefix: 'list/', limit: 2 });
    expect(first.objects.map((o) => o.key)).toEqual(['list/1.txt', 'list/2.txt']);
    const second = await storage.list({ prefix: 'list/', cursor: first.nextCursor });
    expect(second.objects.map((o) => o.key)).toEqual(['list/3.txt']);
    expect(second.nextCursor).toBeUndefined();

    expect(await storage.deletePrefix('list/')).toBe(3);
    expect((await storage.list({ prefix: 'list/' })).objects).toEqual([]);
  });

  it('presigns downloads a browser can fetch, inline or as an attachment', async () => {
    await storage.put('docs/report.txt', 'quarterly', { contentType: 'text/plain' });

    const inline = await fetch((await storage.presignDownload('docs/report.txt')).url);
    expect(inline.status).toBe(200);
    expect(await inline.text()).toBe('quarterly');

    const { url } = await storage.presignDownload('docs/report.txt', { downloadAs: 'Q3.txt' });
    expect((await fetch(url)).headers.get('content-disposition')).toContain('filename="Q3.txt"');
  });

  it('presigns uploads whose size and content type the storage enforces', async () => {
    const upload = await storage.presignUpload('staging/form', {
      contentType: 'text/plain',
      maxBytes: 5,
    });

    const tooBig = await postPresignedForm(upload, new Blob(['0123456789']));
    expect(tooBig.status).toBe(400);
    const wrongType = await postPresignedForm(
      { ...upload, fields: { ...upload.fields, 'Content-Type': 'text/html' } },
      new Blob(['<b>']),
    );
    expect(wrongType.status).toBe(400);
    expect(await storage.exists('staging/form')).toBe(false);

    const accepted = await postPresignedForm(upload, new Blob(['12345']));
    expect(accepted.status).toBe(204);
    expect(await storage.head('staging/form')).toMatchObject({
      size: 5,
      contentType: 'text/plain',
    });
  });

  it('pings the bucket, and names the fix when it is missing', async () => {
    await storage.ping();
    const { S3ObjectStorage } = await import('./s3-object-storage.ts');
    const missing = new S3ObjectStorage(context.clients, 'no-such-bucket-here');
    await expect(missing.ping()).rejects.toThrow('storage:provision');
  });
});
