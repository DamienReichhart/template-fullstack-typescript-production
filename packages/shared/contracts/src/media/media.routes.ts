/**
 * Route segments for the media context. The API declares controllers with them and the web
 * client builds URLs from them, so a renamed route breaks the build, not production.
 */
export const MediaRoutes = {
  videos: {
    controller: 'videos',
    uploads: 'uploads',
    video: ':videoId',
  },
} as const;
