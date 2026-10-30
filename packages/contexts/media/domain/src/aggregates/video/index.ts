export { InvalidVideoError, type InvalidVideoReason } from './errors/invalid-video.error.ts';
export { RejectedVideoError, type RejectedVideoReason } from './errors/rejected-video.error.ts';
export { VideoNotFoundError } from './errors/video-not-found.error.ts';
export { VideoNotProcessingError } from './errors/video-not-processing.error.ts';
export { VideoUploadNotFoundError } from './errors/video-upload-not-found.error.ts';
export { VideoUploadedEvent } from './events/video-uploaded.event.ts';
export { VideoRepository } from './repositories/video.repository.ts';
export { Video, type UploadVideoInput, type VideoProps } from './video.aggregate.ts';
export { OwnerId } from './value-objects/owner-id.value-object.ts';
export {
  PlayableFile,
  type PlayableFileProps,
} from './value-objects/playable-file.value-object.ts';
export {
  SourceVideo,
  VIDEO_MAX_DURATION_SECONDS,
  type SourceVideoProps,
} from './value-objects/source-video.value-object.ts';
export {
  isVideoFailureReason,
  VideoFailureReasons,
  type VideoFailureReason,
} from './value-objects/video-failure-reason.value-object.ts';
export {
  VIDEO_CONTENT_TYPES,
  VIDEO_MAX_BYTES,
  VideoFile,
  type VideoContentType,
} from './value-objects/video-file.value-object.ts';
export { VideoId } from './value-objects/video-id.value-object.ts';
export {
  isVideoStatus,
  VideoStatuses,
  type VideoStatus,
} from './value-objects/video-status.value-object.ts';
