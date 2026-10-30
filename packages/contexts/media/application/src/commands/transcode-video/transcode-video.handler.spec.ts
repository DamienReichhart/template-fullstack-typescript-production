import { describe, expect, it } from 'bun:test';
import { SourceVideo, VIDEO_MAX_DURATION_SECONDS, VideoId } from '@template/media-domain';

import { createMediaTestKit } from '../../testing/media-test-kit.ts';
import { TranscodeVideoCommand } from './transcode-video.command.ts';
import { TranscodeVideoHandler } from './transcode-video.handler.ts';

async function setup() {
  const kit = createMediaTestKit();
  const video = await kit.givenVideo();
  const handler = new TranscodeVideoHandler(kit.videos, kit.storage, kit.transcoder, kit.clock);
  const playableKey = kit.storage.playableKeyOf(video.ownerId.value, video.id.value);
  const reload = async () => {
    const reloaded = await kit.videos.findById(video.id);
    if (!reloaded) throw new Error('The video vanished');
    return reloaded;
  };
  const run = (lastAttempt = false) =>
    handler.execute(new TranscodeVideoCommand(video.id.value, lastAttempt));
  return { kit, video, playableKey, reload, run };
}

describe('TranscodeVideoHandler', () => {
  it('makes the Video Ready and keeps only its Playable file', async () => {
    const { kit, video, playableKey, reload, run } = await setup();

    await run();

    const ready = await reload();
    expect(ready.status).toBe('READY');
    expect(ready.playableFile?.key).toBe(playableKey);
    expect([...kit.storage.files]).toEqual([playableKey]);
    expect(kit.transcoder.calls).toEqual([{ sourceKey: video.sourceKey, playableKey }]);
  });

  it('fails a Video whose Source is too long, without retrying, and keeps no file', async () => {
    const { kit, reload, run } = await setup();
    kit.transcoder.source = SourceVideo.of({
      hasVideoStream: true,
      durationSeconds: VIDEO_MAX_DURATION_SECONDS + 1,
    });

    await run();

    const failed = await reload();
    expect(failed.status).toBe('FAILED');
    expect(failed.failureReason).toBe('too-long');
    expect(kit.storage.files.size).toBe(0);
  });

  it('rethrows a temporary failure and keeps the Source for the retry', async () => {
    const { kit, video, reload, run } = await setup();
    kit.transcoder.failWith = new Error('storage unreachable');

    await expect(run()).rejects.toThrow('storage unreachable');

    expect((await reload()).status).toBe('PROCESSING');
    expect([...kit.storage.files]).toEqual([video.sourceKey]);
  });

  it('fails the Video on the last attempt and deletes both files', async () => {
    const { kit, reload, run } = await setup();
    kit.transcoder.failWith = new Error('ffmpeg crashed');

    await run(true);

    const failed = await reload();
    expect(failed.status).toBe('FAILED');
    expect(failed.failureReason).toBe('processing-failed');
    expect(kit.storage.files.size).toBe(0);
  });

  it('only deletes the Source again when the Video is already settled', async () => {
    const { kit, video, run } = await setup();
    await run();
    kit.storage.files.add(video.sourceKey);

    await run();

    expect(kit.transcoder.calls).toHaveLength(1);
    expect(kit.storage.files.has(video.sourceKey)).toBe(false);
  });

  it('does nothing for a Video that no longer exists', async () => {
    const kit = createMediaTestKit();
    const handler = new TranscodeVideoHandler(kit.videos, kit.storage, kit.transcoder, kit.clock);

    await handler.execute(new TranscodeVideoCommand(VideoId.create().value, false));

    expect(kit.transcoder.calls).toEqual([]);
  });
});
