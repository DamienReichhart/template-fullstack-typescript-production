import { Body, Controller, Get, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import {
  MediaRoutes,
  type VideoListResponse,
  type VideoResponse,
  type VideoUploadResponse,
} from '@template/contracts/media';
import {
  CurrentUser,
  RateLimit,
  RequireVerifiedEmail,
  ZodResponse,
  type AuthenticatedUser,
} from '@template/http';
import {
  GetVideoQuery,
  ListVideosQuery,
  RequestVideoUploadCommand,
  UploadVideoCommand,
} from '@template/media-application';

import { UploadVideoDto } from '../dto/requests/upload-video.dto.ts';
import { VideoUploadDto } from '../dto/requests/video-upload.dto.ts';
import {
  toVideoUploadTicketDto,
  VideoUploadTicketDto,
} from '../dto/responses/video-upload-ticket.dto.ts';
import { toVideoDto, toVideoListDto, VideoDto, VideoListDto } from '../dto/responses/video.dto.ts';

const routes = MediaRoutes.videos;

@ApiTags('videos')
@ApiCookieAuth()
@Controller(routes.controller)
export class VideosController {
  constructor(
    private readonly commands: CommandBus,
    private readonly queries: QueryBus,
  ) {}

  /**
   * Step 1 of uploading a Video: announce the file, receive a form to POST it straight to object
   * storage. Verified emails only, so unverified accounts cannot use the bucket.
   */
  @Post(routes.uploads)
  @RequireVerifiedEmail()
  @RateLimit({ limit: 20, windowSeconds: 3600 })
  @ZodResponse({ status: HttpStatus.CREATED, type: VideoUploadTicketDto })
  async requestUpload(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: VideoUploadDto,
  ): Promise<VideoUploadResponse> {
    const ticket = await this.commands.execute(
      new RequestVideoUploadCommand(user.id, body.contentType, body.size),
    );
    return toVideoUploadTicketDto(ticket);
  }

  /**
   * Step 2: the uploaded file becomes a Video, `PROCESSING` while it is transcoded to H.264.
   * Poll `GET /videos/:videoId` until it is `READY` (or `FAILED`).
   */
  @Post()
  @RequireVerifiedEmail()
  @ZodResponse({ status: HttpStatus.CREATED, type: VideoDto })
  async upload(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UploadVideoDto,
  ): Promise<VideoResponse> {
    const videoId = await this.commands.execute(new UploadVideoCommand(user.id, body.uploadId));
    return this.video(user.id, videoId);
  }

  /** The caller's Videos, newest first. */
  @Get()
  @ZodResponse({ status: HttpStatus.OK, type: VideoListDto })
  async list(@CurrentUser() user: AuthenticatedUser): Promise<VideoListResponse> {
    return toVideoListDto(await this.queries.execute(new ListVideosQuery(user.id)));
  }

  /** One of the caller's Videos; another User's is not found. */
  @Get(routes.video)
  @ZodResponse({ status: HttpStatus.OK, type: VideoDto })
  async get(
    @CurrentUser() user: AuthenticatedUser,
    @Param('videoId', ParseUUIDPipe) videoId: string,
  ): Promise<VideoResponse> {
    return this.video(user.id, videoId);
  }

  private async video(ownerId: string, videoId: string): Promise<VideoResponse> {
    return toVideoDto(await this.queries.execute(new GetVideoQuery(ownerId, videoId)));
  }
}
