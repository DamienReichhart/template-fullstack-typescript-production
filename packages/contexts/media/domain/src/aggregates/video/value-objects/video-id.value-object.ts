import { Identifier } from '@template/ddd';

export class VideoId extends Identifier {
  static create(): VideoId {
    return new VideoId(Identifier.newValue());
  }

  static from(value: string): VideoId {
    return new VideoId(Identifier.assertValid(value));
  }
}
