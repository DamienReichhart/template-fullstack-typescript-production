import { Query } from '@nestjs/cqrs';

import type { VideoView } from '../../views/video.view.ts';

/** Every Video of an Owner, newest first. */
export class ListVideosQuery extends Query<VideoView[]> {
  constructor(readonly ownerId: string) {
    super();
  }
}
