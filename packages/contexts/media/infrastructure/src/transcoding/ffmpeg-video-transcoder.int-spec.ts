import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { readdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { SourceVideo } from '@template/media-domain';
import { RejectedVideoError } from '@template/media-domain';
import { createStorageTestContext } from '@template/storage/testing';

import type { MediaConfig } from '../config/media.config.ts';
import { FfmpegVideoTranscoder } from './ffmpeg-video-transcoder.ts';
import { probeArguments } from './ffmpeg-arguments.ts';
import { runProcess } from './run-process.ts';

/**
 * Real ffmpeg against the test bucket, on a recording shaped like an iPhone's: HEVC 10-bit HLG
 * (HDR), held in portrait through a rotation tag, PCM audio, and the place it was shot.
 */
const context = createStorageTestContext();
let scratch: string;
let fixtures: string;
let transcoder: FfmpegVideoTranscoder;

const HLG = 'color_primaries=bt2020:color_trc=arib-std-b67:colorspace=bt2020nc';

async function ffmpeg(...args: string[]): Promise<void> {
  await runProcess('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args]);
}

async function probe(path: string) {
  return JSON.parse(await runProcess('ffprobe', probeArguments(path))) as {
    streams: Record<string, unknown>[];
    format: { duration: string; tags?: Record<string, string> };
  };
}

beforeAll(async () => {
  fixtures = await mkdtemp(join(tmpdir(), 'media-fixtures-'));
  scratch = await mkdtemp(join(tmpdir(), 'media-scratch-'));
  const landscape = join(fixtures, 'landscape.mov');
  // Tags set on the frames: ffmpeg 7 ignores `-color_*` options when the frames say otherwise.
  await ffmpeg(
    ...['-f', 'lavfi', '-i', 'testsrc2=size=640x360:rate=30'],
    ...['-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=48000', '-t', '2'],
    ...['-vf', `format=yuv420p10le,setparams=${HLG}`],
    ...['-c:v', 'libx265', '-x265-params', 'log-level=error', '-tag:v', 'hvc1'],
    ...['-c:a', 'pcm_s16le', '-metadata', 'location=+48.8584+002.2945/'],
    landscape,
  );
  await ffmpeg(
    '-display_rotation',
    '90',
    '-i',
    landscape,
    '-c',
    'copy',
    join(fixtures, 'iphone.mov'),
  );
  const config = {
    FFMPEG_PATH: 'ffmpeg',
    FFPROBE_PATH: 'ffprobe',
    MEDIA_SCRATCH_DIR: scratch,
  } satisfies MediaConfig;
  transcoder = new FfmpegVideoTranscoder(context.storage, config);
});

beforeEach(async () => {
  await context.reset();
});

afterAll(async () => {
  context.close();
  await rm(fixtures, { recursive: true, force: true });
  await rm(scratch, { recursive: true, force: true });
});

async function givenSource(name: string, bytes?: Uint8Array): Promise<string> {
  const key = `media/sources/owner/${name}`;
  const body = bytes ?? (await readFile(join(fixtures, `${name}.mov`)));
  await context.storage.put(key, body, { contentType: 'video/quicktime' });
  return key;
}

describe('FfmpegVideoTranscoder (integration)', () => {
  it('turns an HDR portrait recording into a Playable file every phone plays', async () => {
    const sourceKey = await givenSource('iphone');
    const seen: SourceVideo[] = [];

    const file = await transcoder.transcode(sourceKey, 'media/videos/owner/iphone', (source) => {
      seen.push(source);
    });

    expect(seen[0]?.hasVideoStream).toBe(true);
    expect(seen[0]?.durationSeconds).toBeCloseTo(2, 1);
    expect(file).toMatchObject({ key: 'media/videos/owner/iphone', width: 360, height: 640 });
    expect((await context.storage.head(file.key))?.contentType).toBe('video/mp4');

    const output = join(fixtures, 'playable.mp4');
    await writeFile(output, (await context.storage.read(file.key)) ?? new Uint8Array());
    const { streams, format } = await probe(output);
    const [video, audio] = streams;
    expect(video).toMatchObject({
      codec_name: 'h264',
      profile: 'High',
      pix_fmt: 'yuv420p',
      color_transfer: 'bt709',
      color_primaries: 'bt709',
      color_space: 'bt709',
      width: 360,
      height: 640,
    });
    expect(video?.['side_data_list']).toBeUndefined();
    expect(audio).toMatchObject({ codec_name: 'aac' });
    expect(format.tags?.['location']).toBeUndefined();
    // The index (moov) comes before the media data, so playback starts at once.
    const bytes = await readFile(output);
    expect(bytes.indexOf('moov')).toBeLessThan(bytes.indexOf('mdat'));
    expect(await readdir(scratch)).toEqual([]);
  });

  it('keeps the colour space of an SDR recording', async () => {
    const path = join(fixtures, 'android.mp4');
    await ffmpeg(
      ...['-f', 'lavfi', '-i', 'testsrc2=size=320x240:rate=25', '-t', '1'],
      ...[
        '-vf',
        'format=yuv420p10le,setparams=color_primaries=smpte170m:color_trc=smpte170m:colorspace=smpte170m',
      ],
      ...['-c:v', 'libx264'],
      path,
    );
    const sourceKey = await givenSource('android', await readFile(path));

    const file = await transcoder.transcode(
      sourceKey,
      'media/videos/owner/android',
      () => undefined,
    );

    const output = join(fixtures, 'android-playable.mp4');
    await writeFile(output, (await context.storage.read(file.key)) ?? new Uint8Array());
    expect((await probe(output)).streams[0]).toMatchObject({
      pix_fmt: 'yuv420p',
      color_primaries: 'smpte170m',
      color_transfer: 'smpte170m',
      color_space: 'smpte170m',
    });
  });

  it('refuses what is not a video before encoding anything, and leaves nothing behind', async () => {
    const sourceKey = await givenSource('notes', new TextEncoder().encode('not a video at all'));

    await expect(
      transcoder.transcode(sourceKey, 'media/videos/owner/notes', () => undefined),
    ).rejects.toBeInstanceOf(RejectedVideoError);
    expect(await context.storage.exists('media/videos/owner/notes')).toBe(false);
    expect(await readdir(scratch)).toEqual([]);
  });

  it('encodes nothing when the rules refuse the Source', async () => {
    const sourceKey = await givenSource('iphone');

    await expect(
      transcoder.transcode(sourceKey, 'media/videos/owner/iphone', () => {
        throw new RejectedVideoError('too-long');
      }),
    ).rejects.toBeInstanceOf(RejectedVideoError);
    expect(await context.storage.exists('media/videos/owner/iphone')).toBe(false);
  });
});
