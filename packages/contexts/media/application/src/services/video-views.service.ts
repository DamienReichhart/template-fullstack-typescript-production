import { Injectable } from '@nestjs/common';
import type { Video } from '@template/media-domain';

import { VideoStorage } from '../ports/storage/video-storage.port.ts';
import { toVideoView, type VideoView } from '../views/video.view.ts';

/** Builds what the Owner sees of a Video, resolving a Ready one to a URL the browser plays. */
@Injectable()
export class VideoViews {
  constructor(private readonly storage: VideoStorage) {}

  async of(video: Video): Promise<VideoView> {
    const key = video.playableFile?.key;
    return toVideoView(video, key ? await this.storage.urlOf(key) : null);
  }
}
