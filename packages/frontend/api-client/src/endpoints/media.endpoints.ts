import { apiPath } from '@template/contracts/common';
import {
  MediaRoutes,
  videoListResponseSchema,
  videoResponseSchema,
  videoUploadResponseSchema,
  type UploadVideoRequest,
  type VideoListResponse,
  type VideoResponse,
  type VideoUploadRequest,
  type VideoUploadResponse,
} from '@template/contracts/media';

import type { HttpClient } from '../core/http-client.ts';

const routes = MediaRoutes.videos;
const videos = (...segments: string[]) => apiPath(routes.controller, ...segments);

export function mediaEndpoints(client: HttpClient) {
  return {
    /** Step 1 of uploading a video; send the file with `uploadToStorage`, then `uploadVideo`. */
    requestVideoUpload: (body: VideoUploadRequest): Promise<VideoUploadResponse> =>
      client.post(videos(routes.uploads), body, { schema: videoUploadResponseSchema }),
    uploadVideo: (body: UploadVideoRequest): Promise<VideoResponse> =>
      client.post(videos(), body, { schema: videoResponseSchema }),
    listVideos: (): Promise<VideoListResponse> =>
      client.get(videos(), { schema: videoListResponseSchema }),
    video: (videoId: string): Promise<VideoResponse> =>
      client.get(videos(encodeURIComponent(videoId)), { schema: videoResponseSchema }),
  };
}

export type MediaEndpoints = ReturnType<typeof mediaEndpoints>;
