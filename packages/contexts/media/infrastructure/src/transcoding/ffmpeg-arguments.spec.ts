import { describe, expect, it } from 'bun:test';

import { playableFileArguments } from './ffmpeg-arguments.ts';
import type { ProbedVideoStream, ProbeReport } from './ffprobe-report.ts';

const sdrVideo: ProbedVideoStream = {
  width: 1920,
  height: 1080,
  hdrTransfer: null,
  primaries: 'bt709',
  transfer: 'bt709',
  matrix: 'bt709',
  range: 'tv',
};
const sdr: ProbeReport = {
  video: sdrVideo,
  audio: { codec: 'aac', channels: 2 },
  durationSeconds: 10,
};

const valueOf = (args: string[], flag: string) => args[args.indexOf(flag) + 1];

describe('playableFileArguments', () => {
  it('encodes H.264 High, 8-bit 4:2:0, CRF 16, preset slow, index first', () => {
    const args = playableFileArguments('/tmp/in', '/tmp/out.mp4', sdr);

    expect(valueOf(args, '-c:v')).toBe('libx264');
    expect(valueOf(args, '-crf')).toBe('16');
    expect(valueOf(args, '-preset')).toBe('slow');
    expect(valueOf(args, '-profile:v')).toBe('high');
    expect(valueOf(args, '-pix_fmt')).toBe('yuv420p');
    expect(valueOf(args, '-movflags')).toBe('+faststart');
    expect(args.at(-1)).toBe('/tmp/out.mp4');
  });

  it('keeps the first video and audio streams, timestamps as recorded, and no metadata', () => {
    const args = playableFileArguments('/tmp/in', '/tmp/out.mp4', sdr);

    expect(args.join(' ')).toContain('-map 0:v:0 -map 0:a:0 -map_metadata -1 -map_chapters -1');
    expect(valueOf(args, '-fps_mode')).toBe('passthrough');
  });

  it('only converts SDR to 8-bit, keeping its colour tags, with even dimensions', () => {
    expect(valueOf(playableFileArguments('i', 'o', sdr), '-vf')).toBe(
      'format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709,crop=trunc(iw/2)*2:trunc(ih/2)*2',
    );
  });

  it('keeps SDR tags it knows and leaves the others unset', () => {
    const android: ProbeReport = {
      ...sdr,
      video: { ...sdrVideo, primaries: 'smpte170m', transfer: 'unknown', matrix: null },
    };
    const untagged: ProbeReport = {
      ...sdr,
      video: { ...sdrVideo, primaries: null, transfer: null, matrix: null },
    };

    expect(valueOf(playableFileArguments('i', 'o', android), '-vf')).toStartWith(
      'format=yuv420p,setparams=color_primaries=smpte170m,crop',
    );
    expect(valueOf(playableFileArguments('i', 'o', untagged), '-vf')).toStartWith(
      'format=yuv420p,crop',
    );
  });

  it('tone maps HDR to SDR BT.709 from what the source is tagged as', () => {
    const hdr: ProbeReport = {
      ...sdr,
      video: { ...sdrVideo, hdrTransfer: 'smpte2084', primaries: null, matrix: null, range: 'pc' },
    };

    const filters = valueOf(playableFileArguments('i', 'o', hdr), '-vf');

    expect(filters).toStartWith('zscale=tin=smpte2084:pin=bt2020:min=bt2020nc:rin=pc:t=linear');
    expect(filters).toContain('tonemap=tonemap=hable');
    expect(filters).toContain(
      'zscale=t=bt709:m=bt709:r=tv,format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709',
    );
  });

  it('copies AAC audio, re-encodes anything else at a transparent bitrate', () => {
    expect(valueOf(playableFileArguments('i', 'o', sdr), '-c:a')).toBe('copy');

    const pcm = playableFileArguments('i', 'o', {
      ...sdr,
      audio: { codec: 'pcm_s16le', channels: 2 },
    });
    expect(valueOf(pcm, '-c:a')).toBe('aac');
    expect(valueOf(pcm, '-b:a')).toBe('256k');

    const surround = playableFileArguments('i', 'o', {
      ...sdr,
      audio: { codec: 'opus', channels: 6 },
    });
    expect(valueOf(surround, '-b:a')).toBe('576k');
  });

  it('maps no audio when there is none', () => {
    const silent = playableFileArguments('i', 'o', { ...sdr, audio: null });

    expect(silent).not.toContain('0:a:0');
    expect(silent).not.toContain('-c:a');
  });

  it('refuses a report without video', () => {
    expect(() => playableFileArguments('i', 'o', { ...sdr, video: null })).toThrow();
  });
});
