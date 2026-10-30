/** The parts of `ffprobe -print_format json -show_streams -show_format` the transcoder reads. */
interface FfprobeStream {
  codec_type?: string;
  codec_name?: string;
  width?: number;
  height?: number;
  pix_fmt?: string;
  color_transfer?: string;
  color_primaries?: string;
  color_space?: string;
  color_range?: string;
  channels?: number;
  duration?: string;
  disposition?: { attached_pic?: number };
}

interface FfprobeOutput {
  streams?: FfprobeStream[];
  format?: { duration?: string };
}

/** Transfer functions of HDR video: PQ (HDR10, Dolby Vision) and HLG (phones, broadcast). */
const HDR_TRANSFERS = ['smpte2084', 'arib-std-b67'] as const;
export type HdrTransfer = (typeof HDR_TRANSFERS)[number];

const isHdrTransfer = (value: string | undefined): value is HdrTransfer =>
  (HDR_TRANSFERS as readonly (string | undefined)[]).includes(value);

export interface ProbedVideoStream {
  width: number;
  height: number;
  /** Set for HDR video, which must be tone mapped to SDR. */
  hdrTransfer: HdrTransfer | null;
  /** Colour primaries, transfer and matrix as tagged (`bt709`, `bt2020nc`, …), when tagged. */
  primaries: string | null;
  transfer: string | null;
  matrix: string | null;
  /** `pc` (full) or `tv` (limited), when tagged. */
  range: string | null;
}

export interface ProbedAudioStream {
  codec: string;
  channels: number;
}

/** What a media file holds, as far as transcoding it is concerned. */
export interface ProbeReport {
  /** The first real video stream; cover art (an attached picture) does not count. */
  video: ProbedVideoStream | null;
  audio: ProbedAudioStream | null;
  durationSeconds: number;
}

const seconds = (value: string | undefined): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

/** Reads `ffprobe`'s JSON. Missing or unknown values become nulls, never errors. */
export function parseProbeReport(json: string): ProbeReport {
  const output = JSON.parse(json) as FfprobeOutput;
  const streams = output.streams ?? [];
  const video = streams.find(
    (stream) =>
      stream.codec_type === 'video' && !stream.disposition?.attached_pic && !!stream.width,
  );
  const audio = streams.find((stream) => stream.codec_type === 'audio');
  return {
    video: video
      ? {
          width: video.width ?? 0,
          height: video.height ?? 0,
          hdrTransfer: isHdrTransfer(video.color_transfer) ? video.color_transfer : null,
          primaries: video.color_primaries ?? null,
          transfer: video.color_transfer ?? null,
          matrix: video.color_space ?? null,
          range: video.color_range ?? null,
        }
      : null,
    audio: audio ? { codec: audio.codec_name ?? 'unknown', channels: audio.channels ?? 2 } : null,
    durationSeconds: seconds(output.format?.duration) ?? seconds(video?.duration) ?? 0,
  };
}
