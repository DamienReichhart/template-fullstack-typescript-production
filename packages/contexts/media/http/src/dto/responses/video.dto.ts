import {
  videoListResponseSchema,
  videoResponseSchema,
  type VideoListResponse,
  type VideoResponse,
} from '@template/contracts/media';
import { createZodDto } from '@template/http';
import type { VideoView } from '@template/media-application';

export class VideoDto extends createZodDto(videoResponseSchema) {}

export class VideoListDto extends createZodDto(videoListResponseSchema) {}

export function toVideoDto(view: VideoView): VideoResponse {
  return { ...view, createdAt: view.createdAt.toISOString() };
}

export function toVideoListDto(views: VideoView[]): VideoListResponse {
  return { videos: views.map(toVideoDto) };
}
