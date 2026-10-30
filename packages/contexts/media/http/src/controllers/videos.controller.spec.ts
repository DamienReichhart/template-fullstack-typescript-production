import 'reflect-metadata';

import { afterEach, describe, expect, it } from 'bun:test';
import {
  VIDEO_CONTENT_TYPES,
  VIDEO_MAX_BYTES,
  VIDEO_MAX_DURATION_SECONDS,
} from '@template/contracts/media';
import { OTHER_OWNER_ID, OWNER_ID } from '@template/media-application/testing';
import * as domain from '@template/media-domain';

import { createMediaTestApp } from '../testing/create-media-test-app.ts';

let context: Awaited<ReturnType<typeof createMediaTestApp>>;

afterEach(async () => {
  await context.close();
});

async function uploaded() {
  context = await createMediaTestApp();
  const caller = context.as();
  const ticket = await caller.post('/api/v1/videos/uploads').send({
    contentType: 'video/quicktime',
    size: 50_000_000,
  });
  context.kit.storage.receive(ticket.body.uploadId);
  return { ...context, caller, ticket };
}

describe('VideosController', () => {
  it('uploads a Video in two steps: ticket, then the uploaded file, Processing', async () => {
    const { caller, ticket, kit } = await uploaded();
    expect(ticket.status).toBe(201);
    expect(ticket.body.url).toBe('https://storage.test/bucket');
    expect(ticket.body.fields['Content-Type']).toBe('video/quicktime');

    const created = await caller.post('/api/v1/videos').send({ uploadId: ticket.body.uploadId });

    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ status: 'PROCESSING', url: null, failureReason: null });
    await Bun.sleep(10);
    expect(kit.transcoding.scheduled).toEqual([created.body.id]);
  });

  it('plays a Video once transcoded, and lists it', async () => {
    const { caller, ticket, kit } = await uploaded();
    const created = await caller.post('/api/v1/videos').send({ uploadId: ticket.body.uploadId });
    const video = await kit.videos.findById(domain.VideoId.from(created.body.id));
    if (!video) throw new Error('The video was not recorded');
    video.markReady(
      domain.PlayableFile.of({
        key: kit.storage.playableKeyOf(OWNER_ID, video.id.value),
        size: 1,
        width: 1080,
        height: 1920,
        durationSeconds: 4.2,
      }),
      kit.clock.now(),
    );

    const ready = await caller.get(`/api/v1/videos/${video.id.value}`);
    const listed = await caller.get('/api/v1/videos');

    expect(ready.status).toBe(200);
    expect(ready.body).toMatchObject({ status: 'READY', width: 1080, height: 1920 });
    expect(ready.body.url).toContain(`/media/videos/${OWNER_ID}/`);
    expect(listed.body.videos).toEqual([ready.body]);
  });

  it("hides another User's Video and answers 404 for an unknown one", async () => {
    const { caller, ticket } = await uploaded();
    const created = await caller.post('/api/v1/videos').send({ uploadId: ticket.body.uploadId });

    const stranger = await context.as(OTHER_OWNER_ID).get(`/api/v1/videos/${created.body.id}`);
    const unknown = await caller.get('/api/v1/videos/0199b0a0-0000-7000-8000-0000000000ff');

    expect(stranger.status).toBe(404);
    expect(stranger.body.code).toBe('VIDEO_NOT_FOUND');
    expect(unknown.status).toBe(404);
    expect((await context.as(OTHER_OWNER_ID).get('/api/v1/videos')).body.videos).toEqual([]);
  });

  it('refuses unsupported or oversized files with translatable field errors', async () => {
    context = await createMediaTestApp();

    const response = await context
      .as()
      .post('/api/v1/videos/uploads')
      .send({
        contentType: 'video/webm',
        size: VIDEO_MAX_BYTES + 1,
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_FAILED');
    expect(response.body.errors.map((e: { message: string }) => e.message).sort()).toEqual([
      'validation.video.contentType',
      'validation.video.tooLarge',
    ]);
  });

  it('refuses an upload that never arrived', async () => {
    context = await createMediaTestApp();

    const response = await context
      .as()
      .post('/api/v1/videos')
      .send({ uploadId: '0199b0a0-0000-4000-8000-0000000000aa' });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VIDEO_UPLOAD_NOT_FOUND');
  });

  it('requires a verified email to upload', async () => {
    context = await createMediaTestApp();

    const response = await context
      .as(OWNER_ID, { verified: false })
      .post('/api/v1/videos/uploads')
      .send({ contentType: 'video/mp4', size: 10 });

    expect(response.status).toBe(403);
  });

  it('keeps the contract rules in step with the domain', () => {
    expect(VIDEO_CONTENT_TYPES).toEqual(domain.VIDEO_CONTENT_TYPES);
    expect(VIDEO_MAX_BYTES).toBe(domain.VIDEO_MAX_BYTES);
    expect(VIDEO_MAX_DURATION_SECONDS).toBe(domain.VIDEO_MAX_DURATION_SECONDS);
  });
});
