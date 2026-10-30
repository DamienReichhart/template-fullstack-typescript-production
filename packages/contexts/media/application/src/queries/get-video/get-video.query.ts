import { Query } from '@nestjs/cqrs';

import type { VideoView } from '../../views/video.view.ts';

/** One Video of its Owner. Another User's Video is not found. */
export class GetVideoQuery extends Query<VideoView> {
  constructor(
    readonly ownerId: string,
    readonly videoId: string,
  ) {
    super();
  }
}
