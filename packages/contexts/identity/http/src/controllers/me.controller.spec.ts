import 'reflect-metadata';

import { afterEach, describe, expect, it } from 'bun:test';
import { AVATAR_CONTENT_TYPES, AVATAR_MAX_BYTES } from '@template/contracts/identity';
import * as domain from '@template/identity-domain';

import { createIdentityTestApp } from '../testing/create-identity-test-app.ts';

let context: Awaited<ReturnType<typeof createIdentityTestApp>>;

afterEach(async () => {
  await context.close();
});

async function signedIn({ verified = true } = {}) {
  context = await createIdentityTestApp();
  await context.kit.givenUser({
    email: 'ada@example.com',
    password: 'correct horse battery',
    verified,
  });
  await context
    .post('/api/v1/auth/login')
    .send({ email: 'ada@example.com', password: 'correct horse battery' });
  return context;
}

describe('MeController avatar', () => {
  it('changes the avatar in two steps: ticket, then the uploaded file', async () => {
    const { post, put, agent, kit } = await signedIn();

    const ticket = await post('/api/v1/me/avatar/uploads').send({
      contentType: 'image/png',
      size: 1024,
    });
    expect(ticket.status).toBe(201);
    expect(ticket.body.url).toBe('https://storage.test/bucket');
    expect(ticket.body.fields['Content-Type']).toBe('image/png');

    kit.avatars.receive(ticket.body.uploadId);
    const changed = await put('/api/v1/me/avatar').send({ uploadId: ticket.body.uploadId });

    expect(changed.status).toBe(200);
    expect(changed.body.avatarUrl).toContain(`/identity/avatars/`);
    expect((await agent.get('/api/v1/me')).body.avatarUrl).toBe(changed.body.avatarUrl);
  });

  it('removes the avatar and schedules the deletion of its file', async () => {
    const { post, put, del, kit } = await signedIn();
    const ticket = await post('/api/v1/me/avatar/uploads').send({
      contentType: 'image/png',
      size: 1,
    });
    kit.avatars.receive(ticket.body.uploadId);
    await put('/api/v1/me/avatar').send({ uploadId: ticket.body.uploadId });

    const removed = await del('/api/v1/me/avatar');

    expect(removed.status).toBe(200);
    expect(removed.body.avatarUrl).toBeNull();
    await Bun.sleep(10);
    expect(kit.housekeeping.avatarFilesToDelete).toHaveLength(1);
  });

  it('refuses unsupported or oversized pictures with translatable field errors', async () => {
    const { post } = await signedIn();

    const response = await post('/api/v1/me/avatar/uploads').send({
      contentType: 'image/svg+xml',
      size: AVATAR_MAX_BYTES + 1,
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_FAILED');
    expect(response.body.errors.map((e: { message: string }) => e.message).sort()).toEqual([
      'validation.avatar.contentType',
      'validation.avatar.tooLarge',
    ]);
  });

  it('answers AVATAR_UPLOAD_NOT_FOUND and AVATAR_INVALID for bad uploads', async () => {
    const { post, put, kit } = await signedIn();
    const notSent = await put('/api/v1/me/avatar').send({
      uploadId: '00000000-0000-4000-8000-000000000999',
    });
    expect(notSent.body).toMatchObject({ status: 400, code: 'AVATAR_UPLOAD_NOT_FOUND' });

    const ticket = await post('/api/v1/me/avatar/uploads').send({
      contentType: 'image/png',
      size: 5,
    });
    kit.avatars.receive(ticket.body.uploadId, { contentType: 'text/html', size: 5 });
    const lying = await put('/api/v1/me/avatar').send({ uploadId: ticket.body.uploadId });
    expect(lying.body).toMatchObject({ status: 400, code: 'AVATAR_INVALID' });
  });

  it('requires a verified email to upload', async () => {
    const { post } = await signedIn({ verified: false });
    const response = await post('/api/v1/me/avatar/uploads').send({
      contentType: 'image/png',
      size: 10,
    });
    expect(response.body.code).toBe('EMAIL_NOT_VERIFIED');
  });

  it('applies the same avatar rules as the domain', () => {
    expect([...AVATAR_CONTENT_TYPES]).toEqual([...domain.AVATAR_CONTENT_TYPES]);
    expect(AVATAR_MAX_BYTES).toBe(domain.AVATAR_MAX_BYTES);
  });
});
