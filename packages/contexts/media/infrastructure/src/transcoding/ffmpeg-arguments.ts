import type { ProbedAudioStream, ProbedVideoStream, ProbeReport } from './ffprobe-report.ts';

/** ffmpeg options, written `{ flag: value }` so each flag stays next to its value. */
type Options = Record<string, string>;

const flags = (options: Options): string[] => Object.entries(options).flat();

/**
 * Visually lossless H.264: at CRF 16 the difference with the Source cannot be seen, while
 * every phone and browser decodes the result in hardware. `slow` buys quality per byte.
 */
const VIDEO_ENCODING: Options = {
  '-c:v': 'libx264',
  '-preset': 'slow',
  '-crf': '16',
  '-profile:v': 'high',
  '-pix_fmt': 'yuv420p',
};

/** SDR colour tags `setparams` accepts, as ffprobe names them; anything else stays unset. */
const PRIMARIES = ['bt709', 'bt470m', 'bt470bg', 'smpte170m', 'smpte240m', 'film', 'bt2020'];
const TRANSFERS = ['bt709', 'bt470m', 'bt470bg', 'smpte170m', 'smpte240m', 'iec61966-2-1'];
const MATRICES = ['bt709', 'fcc', 'bt470bg', 'smpte170m', 'smpte240m', 'bt2020nc', 'bt2020c'];

interface ColourTags {
  primaries: string | null;
  transfer: string | null;
  matrix: string | null;
}

/** Rec. 709, the colour space every SDR player assumes. */
const BT709: ColourTags = { primaries: 'bt709', transfer: 'bt709', matrix: 'bt709' };

/**
 * Tags the frames with their colour space, so the encoder signals it: ffmpeg 7 drops tags in
 * pixel format conversions, and `-color_*` output options lose to what the frames say.
 */
function colourTags({ primaries, transfer, matrix }: ColourTags): string[] {
  const known = (value: string | null, allowed: string[]) =>
    value !== null && allowed.includes(value) ? value : null;
  const params = [
    ['color_primaries', known(primaries, PRIMARIES)],
    ['color_trc', known(transfer, TRANSFERS)],
    ['colorspace', known(matrix, MATRICES)],
  ].filter(([, value]) => value !== null);
  return params.length > 0 ? [`setparams=${params.map((p) => p.join('=')).join(':')}`] : [];
}

/** AAC is played everywhere: kept bit for bit, so it loses nothing. */
const COPIED_AUDIO_CODECS = ['aac'];

/** Even dimensions, which 4:2:0 needs: at most one pixel column or row is cropped. */
const EVEN_DIMENSIONS = 'crop=trunc(iw/2)*2:trunc(ih/2)*2';

/**
 * HDR (PQ or HLG, 10-bit BT.2020) to SDR BT.709: linearise, map the highlights into SDR range
 * with Hable's curve, then back to BT.709. Without it HDR looks grey and washed out on SDR
 * screens, and 10-bit H.264 plays nowhere.
 */
function toneMapping(video: ProbedVideoStream): string {
  const input = [
    `tin=${video.hdrTransfer}`,
    `pin=${video.primaries ?? 'bt2020'}`,
    `min=${video.matrix ?? 'bt2020nc'}`,
    `rin=${video.range === 'pc' ? 'pc' : 'tv'}`,
  ].join(':');
  return [
    `zscale=${input}:t=linear:npl=100`,
    'format=gbrpf32le',
    'zscale=p=bt709',
    'tonemap=tonemap=hable:desat=0',
    'zscale=t=bt709:m=bt709:r=tv',
    'format=yuv420p',
  ].join(',');
}

function videoFilters(video: ProbedVideoStream): string {
  // SDR only needs 8-bit 4:2:0 (swscale dithers 10-bit sources down) and keeps its colour
  // space; HDR becomes BT.709. Rotation is applied by ffmpeg itself (autorotate), before these.
  const colour = video.hdrTransfer
    ? [toneMapping(video), ...colourTags(BT709)]
    : ['format=yuv420p', ...colourTags(video)];
  return [...colour, EVEN_DIMENSIONS].join(',');
}

function audioEncoding(audio: ProbedAudioStream | null): Options {
  if (!audio) return {};
  if (COPIED_AUDIO_CODECS.includes(audio.codec)) return { '-c:a': 'copy' };
  // Transparent AAC: 256 kb/s for stereo, 96 kb/s per channel beyond.
  const bitrate = Math.max(256, 96 * audio.channels);
  return { '-c:a': 'aac', '-b:a': `${bitrate}k` };
}

/**
 * The ffmpeg command line turning `input` into the Playable file at `output`: the first video
 * and audio streams only, every other stream and all metadata (locations included) dropped,
 * timestamps kept as recorded (variable frame rates stay smooth), MP4 index first so playback
 * starts before the download ends.
 */
export function playableFileArguments(input: string, output: string, probe: ProbeReport): string[] {
  if (!probe.video) throw new Error('A Playable file needs a video stream');
  return [
    '-hide_banner',
    '-nostdin',
    '-y',
    ...flags({ '-loglevel': 'error', '-i': input }),
    ...flags({ '-map': '0:v:0' }),
    ...(probe.audio ? flags({ '-map': '0:a:0' }) : []),
    ...flags({
      '-map_metadata': '-1',
      '-map_chapters': '-1',
      '-fps_mode': 'passthrough',
      '-vf': videoFilters(probe.video),
      ...VIDEO_ENCODING,
      ...audioEncoding(probe.audio),
      '-movflags': '+faststart',
      '-f': 'mp4',
    }),
    output,
  ];
}

/** The ffprobe command line reporting `input` as JSON (`parseProbeReport`). */
export function probeArguments(input: string): string[] {
  return ['-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', input];
}
