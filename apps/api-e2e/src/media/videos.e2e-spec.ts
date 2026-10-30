import { describe, expect, it } from 'bun:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { $, S3Client, SQL } from 'bun';

import { apiPath } from '@template/contracts/common';
import {
  MediaRoutes,
  type VideoListResponse,
  type VideoResponse,
  type VideoUploadResponse,
} from '@template/contracts/media';

import type { ApiSession } from '../support/api-session.ts';
import { e2eEnv } from '../support/env.ts';
import { verifiedUser } from '../support/users.ts';

const videosPath = apiPath(MediaRoutes.videos.controller);
const uploadsPath = apiPath(MediaRoutes.videos.controller, MediaRoutes.videos.uploads);
const videoPath = (id: string) => apiPath(MediaRoutes.videos.controller, id);
const bucket = new S3Client(e2eEnv.storage);

/**
 * A recording shaped like an iPhone's: HEVC 10-bit HLG (HDR), held in portrait by a rotation
 * tag, PCM audio, and the place it was shot. Made with the local ffmpeg.
 */
async function iphoneRecording(directory: string): Promise<Uint8Array> {
  // Tags set on the frames: ffmpeg 7 ignores `-color_*` options when the frames say otherwise.
  const HLG =
    'format=yuv420p10le,setparams=color_primaries=bt2020:color_trc=arib-std-b67:colorspace=bt2020nc';
  const landscape = join(directory, 'landscape.mov');
  const portrait = join(directory, 'portrait.mov');
  await $`ffmpeg -hide_banner -loglevel error -y -f lavfi -i testsrc2=size=640x360:rate=30 -f lavfi -i sine=frequency=440:sample_rate=48000 -t 2 -vf ${HLG} -c:v libx265 -x265-params log-level=error -tag:v hvc1 -c:a pcm_s16le -metadata location=+48.8584+002.2945/ ${landscape}`.quiet();
  await $`ffmpeg -hide_banner -loglevel error -y -display_rotation 90 -i ${landscape} -c copy ${portrait}`.quiet();
  return new Uint8Array(await readFile(portrait));
}

/** What the browser does: announce the file, post it to the storage, make it a video. */
async function uploadVideo(session: ApiSession, file: Uint8Array, contentType: string) {
  const ticket = await session.post<VideoUploadResponse>(uploadsPath, {
    contentType,
    size: file.byteLength,
  });
  expect(ticket.status).toBe(201);

  const form = new FormData();
  for (const [name, value] of Object.entries(ticket.body.fields)) form.append(name, value);
  form.append('file', new Blob([file]));
  expect((await fetch(ticket.body.url, { method: 'POST', body: form })).status).toBe(204);

  return session.post<VideoResponse>(videosPath, { uploadId: ticket.body.uploadId });
}

/** The worker transcodes from a queue: poll as the web app does, until the video settles. */
async function settled(session: ApiSession, id: string, timeoutMs = 50_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const { body } = await session.get<VideoResponse>(videoPath(id));
    if (body.status !== 'PROCESSING') return body;
    await Bun.sleep(500);
  }
  throw new Error(`Video ${id} still PROCESSING after ${timeoutMs} ms. Is the worker running?`);
}

async function sourceKeyOf(id: string): Promise<string> {
  const sql = new SQL(e2eEnv.databaseUrl);
  try {
    const [row] = await sql`SELECT source_key FROM videos WHERE id = ${id}`;
    return (row as { source_key: string }).source_key;
  } finally {
    await sql.close();
  }
}

describe('videos', () => {
  it('turns an HDR portrait recording into the one H.264 file every phone plays', async () => {
    const { session } = await verifiedUser();
    const directory = await mkdtemp(join(tmpdir(), 'e2e-video-'));
    try {
      const created = await uploadVideo(
        session,
        await iphoneRecording(directory),
        'video/quicktime',
      );
      expect(created.status).toBe(201);
      expect(created.body).toMatchObject({ status: 'PROCESSING', url: null });

      const ready = await settled(session, created.body.id);
      expect(ready).toMatchObject({
        status: 'READY',
        width: 360,
        height: 640,
        failureReason: null,
      });

      const playable = await fetch(ready.url ?? '');
      expect(playable.headers.get('content-type')).toBe('video/mp4');
      // Piped to ffprobe: what the bucket serves is never written to disk.
      const bytes = new Uint8Array(await playable.arrayBuffer());
      const probe = JSON.parse(
        await $`ffprobe -v error -print_format json -show_streams -show_format -i pipe:0 < ${bytes}`.text(),
      ) as { streams: Record<string, unknown>[]; format: { tags?: Record<string, string> } };
      expect(probe.streams[0]).toMatchObject({
        codec_name: 'h264',
        profile: 'High',
        pix_fmt: 'yuv420p',
        color_transfer: 'bt709',
      });
      expect(probe.streams[1]).toMatchObject({ codec_name: 'aac' });
      expect(probe.format.tags?.['location']).toBeUndefined();

      // The Source is gone: the Playable file is all that is left.
      expect(await bucket.file(await sourceKeyOf(created.body.id)).exists()).toBe(false);
      const listed = await session.get<VideoListResponse>(videosPath);
      expect(listed.body.videos.map((video) => video.id)).toEqual([created.body.id]);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }, 60_000);

  it('fails a file that only looks like a video, and keeps none of it', async () => {
    const { session } = await verifiedUser();
    const fake = new Uint8Array([
      0,
      0,
      0,
      0x18,
      ...new TextEncoder().encode('ftypmp42'),
      ...new Uint8Array(64),
    ]);

    const created = await uploadVideo(session, fake, 'video/mp4');
    const failed = await settled(session, created.body.id);

    expect(failed).toMatchObject({ status: 'FAILED', failureReason: 'unreadable', url: null });
    expect(await bucket.file(await sourceKeyOf(created.body.id)).exists()).toBe(false);
  }, 60_000);

  it('never shows a video to anyone but its owner', async () => {
    const owner = await verifiedUser();
    const stranger = await verifiedUser();
    const fake = new Uint8Array([0, 0, 0, 0x18, ...new TextEncoder().encode('ftypmp42')]);
    const created = await uploadVideo(owner.session, fake, 'video/mp4');

    const peek = await stranger.session.get(videoPath(created.body.id));

    expect(peek.status).toBe(404);
    expect((await stranger.session.get<VideoListResponse>(videosPath)).body.videos).toEqual([]);
  });
});
