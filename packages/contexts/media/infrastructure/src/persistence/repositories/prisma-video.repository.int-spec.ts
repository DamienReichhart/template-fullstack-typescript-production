import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { OwnerId, PlayableFile, Video, VideoId } from '@template/media-domain';

import { createPersistenceTestContext } from './persistence-test-context.ts';
import { PrismaVideoRepository } from './prisma-video.repository.ts';

const owner = OwnerId.from('0199b0a0-0000-7000-8000-000000000001');
const other = OwnerId.from('0199b0a0-0000-7000-8000-000000000002');

const upload = (ownerId: OwnerId, now: Date) => {
  const id = VideoId.create();
  return Video.upload({
    id,
    ownerId,
    sourceKey: `media/sources/${ownerId.value}/${id.value}`,
    now,
  });
};

describe('PrismaVideoRepository (integration)', () => {
  let context: Awaited<ReturnType<typeof createPersistenceTestContext>>;
  let videos: PrismaVideoRepository;

  beforeAll(async () => {
    context = await createPersistenceTestContext();
    videos = new PrismaVideoRepository(context.host);
  });
  beforeEach(async () => {
    await context.reset();
  });
  afterAll(async () => {
    await context.close();
  });

  it('saves a Video, then its Playable file once Ready', async () => {
    const video = upload(owner, new Date('2026-01-01T00:00:00.000Z'));
    await videos.save(video);
    expect((await videos.findById(video.id))?.status).toBe('PROCESSING');

    video.markReady(
      PlayableFile.of({
        key: `media/videos/${owner.value}/${video.id.value}`,
        size: 3 * 1024 ** 3,
        width: 2160,
        height: 3840,
        durationSeconds: 61.25,
      }),
      new Date('2026-01-01T00:03:00.000Z'),
    );
    await videos.save(video);

    const reloaded = await videos.findById(video.id);
    expect(reloaded?.status).toBe('READY');
    expect(reloaded?.playableFile).toEqual(video.playableFile);
    expect(reloaded?.updatedAt).toEqual(new Date('2026-01-01T00:03:00.000Z'));
  });

  it("lists an Owner's Videos only, newest first", async () => {
    const first = upload(owner, new Date('2026-01-01T00:00:00.000Z'));
    const second = upload(owner, new Date('2026-01-02T00:00:00.000Z'));
    await videos.save(first);
    await videos.save(upload(other, new Date('2026-01-03T00:00:00.000Z')));
    await videos.save(second);

    const listed = await videos.findByOwner(owner);

    expect(listed.map((video) => video.id.value)).toEqual([second.id.value, first.id.value]);
  });
});
