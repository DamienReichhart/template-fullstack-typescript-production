import { ValueObject } from '@template/ddd';

export interface PlayableFileProps {
  /** Object storage key of the file. */
  key: string;
  size: number;
  width: number;
  height: number;
  durationSeconds: number;
}

/**
 * The file a Video is played from: H.264 High, 8-bit 4:2:0, SDR BT.709, AAC audio, in an MP4
 * whose index comes first. The only file a Ready Video keeps.
 */
export class PlayableFile extends ValueObject<PlayableFileProps> {
  static of(props: PlayableFileProps): PlayableFile {
    return new PlayableFile(props);
  }

  get key(): string {
    return this.props.key;
  }

  get size(): number {
    return this.props.size;
  }

  get width(): number {
    return this.props.width;
  }

  get height(): number {
    return this.props.height;
  }

  get durationSeconds(): number {
    return this.props.durationSeconds;
  }
}
