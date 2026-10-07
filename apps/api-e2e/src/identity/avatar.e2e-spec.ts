import { describe, expect, it } from 'bun:test';

import { apiPath } from '@template/contracts/common';
import {
  IdentityErrorCode,
  IdentityRoutes,
  type AvatarUploadResponse,
  type CurrentUserResponse,
} from '@template/contracts/identity';

import type { ApiSession } from '../support/api-session.ts';
import { mePath, registerUser, verifiedUser } from '../support/users.ts';

const avatarPath = apiPath(IdentityRoutes.me.controller, IdentityRoutes.me.avatar);
const uploadsPath = apiPath(IdentityRoutes.me.controller, IdentityRoutes.me.avatarUploads);

/** A real 1×1 PNG. */
const PNG = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  ),
  (char) => char.charCodeAt(0),
);

/** What the browser does: announce the file, post it to the storage, show it. */
async function uploadAvatar(session: ApiSession, file: Uint8Array, contentType = 'image/png') {
  const ticket = await session.post<AvatarUploadResponse>(uploadsPath, {
    contentType,
    size: file.byteLength,
  });
  expect(ticket.status).toBe(201);

  const form = new FormData();
  for (const [name, value] of Object.entries(ticket.body.fields)) form.append(name, value);
  form.append('file', new Blob([file]));
  const posted = await fetch(ticket.body.url, { method: 'POST', body: form });
  expect(posted.status).toBe(204);

  return session.request<CurrentUserResponse>('PUT', avatarPath, {
    uploadId: ticket.body.uploadId,
  });
}

/** The worker deletes replaced files from a queue: poll until the URL stops answering. */
async function waitUntilGone(url: string, timeoutMs = 15_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if ((await fetch(url)).status === 404) return;
    await Bun.sleep(200);
  }
  throw new Error(`${url} still answers after ${timeoutMs} ms. Is the worker running?`);
}

describe('avatar', () => {
  it('uploads straight to storage, then serves the picture from a presigned URL', async () => {
    const { session } = await verifiedUser();

    const changed = await uploadAvatar(session, PNG);

    expect(changed.status).toBe(200);
    const url = changed.body.avatarUrl ?? '';
    const picture = await fetch(url);
    expect(picture.headers.get('content-type')).toBe('image/png');
    expect(new Uint8Array(await picture.arrayBuffer())).toEqual(PNG);
    // Stable within the hour, so browsers cache it between page loads.
    expect((await session.get<CurrentUserResponse>(mePath)).body.avatarUrl).toBe(url);
  });

  it('deletes the replaced file in the worker, and the removed one too', async () => {
    const { session } = await verifiedUser();
    const first = (await uploadAvatar(session, PNG)).body.avatarUrl ?? '';

    const second = (await uploadAvatar(session, PNG)).body.avatarUrl ?? '';
    expect(second).not.toBe(first);
    await waitUntilGone(first);

    const removed = await session.request<CurrentUserResponse>('DELETE', avatarPath);
    expect(removed.body.avatarUrl).toBeNull();
    await waitUntilGone(second);
  });

  it('refuses a file that is not the picture it claims to be, and keeps nothing', async () => {
    const { session } = await verifiedUser();
    const html = new TextEncoder().encode('<html><script>alert(1)</script></html>');

    const response = await uploadAvatar(session, html);

    expect(response.status).toBe(400);
    expect((response.body as unknown as { code: string }).code).toBe(
      IdentityErrorCode.avatarInvalid,
    );
  });

  it('lets the storage refuse a file larger than announced', async () => {
    const { session } = await verifiedUser();
    const ticket = await session.post<AvatarUploadResponse>(uploadsPath, {
      contentType: 'image/png',
      size: 10,
    });
    const form = new FormData();
    for (const [name, value] of Object.entries(ticket.body.fields)) form.append(name, value);
    form.append('file', new Blob([PNG]));

    expect((await fetch(ticket.body.url, { method: 'POST', body: form })).status).toBe(400);
    const claimed = await session.request('PUT', avatarPath, { uploadId: ticket.body.uploadId });
    expect((claimed.body as { code: string }).code).toBe(IdentityErrorCode.avatarUploadNotFound);
  });

  it('keeps unverified accounts out of the bucket', async () => {
    const { session } = await registerUser();
    const response = await session.post<{ code: string }>(uploadsPath, {
      contentType: 'image/png',
      size: 10,
    });
    expect(response.body.code).toBe(IdentityErrorCode.emailNotVerified);
  });
});
