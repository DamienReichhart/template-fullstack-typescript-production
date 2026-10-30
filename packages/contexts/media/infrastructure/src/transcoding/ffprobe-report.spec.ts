import { describe, expect, it } from 'bun:test';

import { parseProbeReport } from './ffprobe-report.ts';

const report = (output: unknown) => parseProbeReport(JSON.stringify(output));

describe('parseProbeReport', () => {
  it('reads an iPhone HDR recording: HLG video, AAC audio', () => {
    expect(
      report({
        streams: [
          {
            codec_type: 'video',
            codec_name: 'hevc',
            width: 3840,
            height: 2160,
            color_transfer: 'arib-std-b67',
            color_primaries: 'bt2020',
            color_space: 'bt2020nc',
            color_range: 'tv',
          },
          { codec_type: 'audio', codec_name: 'aac', channels: 2 },
          { codec_type: 'data', codec_name: 'none' },
        ],
        format: { duration: '12.480000' },
      }),
    ).toEqual({
      video: {
        width: 3840,
        height: 2160,
        hdrTransfer: 'arib-std-b67',
        primaries: 'bt2020',
        transfer: 'arib-std-b67',
        matrix: 'bt2020nc',
        range: 'tv',
      },
      audio: { codec: 'aac', channels: 2 },
      durationSeconds: 12.48,
    });
  });

  it('treats untagged and SDR video as SDR', () => {
    const sdr = report({
      streams: [{ codec_type: 'video', width: 1920, height: 1080, color_transfer: 'bt709' }],
    });
    expect(sdr.video?.hdrTransfer).toBeNull();
    expect(sdr.audio).toBeNull();
    expect(sdr.durationSeconds).toBe(0);
  });

  it('finds no video in cover art or an audio file', () => {
    const music = report({
      streams: [
        { codec_type: 'audio', codec_name: 'mp3', channels: 2 },
        { codec_type: 'video', width: 600, height: 600, disposition: { attached_pic: 1 } },
      ],
      format: { duration: 'N/A' },
    });
    expect(music.video).toBeNull();
    expect(music.durationSeconds).toBe(0);
  });

  it('falls back to the video stream duration', () => {
    expect(
      report({ streams: [{ codec_type: 'video', width: 2, height: 2, duration: '3.5' }] })
        .durationSeconds,
    ).toBe(3.5);
  });
});
