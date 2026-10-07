import { Body, Controller, Delete, Get, HttpStatus, Post, Put } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import {
  IdentityRoutes,
  type AvatarUploadResponse,
  type CurrentUserResponse,
} from '@template/contracts/identity';
import { RateLimit, ZodResponse } from '@template/http';
import {
  ChangeAvatarCommand,
  GetCurrentUserQuery,
  RemoveAvatarCommand,
  RequestAvatarUploadCommand,
} from '@template/identity-application';

import { CurrentUser, type AuthenticatedUser } from '../decorators/current-user.decorator.ts';
import { RequireVerifiedEmail } from '../decorators/require-verified-email.decorator.ts';
import { AvatarUploadDto } from '../dto/requests/avatar-upload.dto.ts';
import { ChangeAvatarDto } from '../dto/requests/change-avatar.dto.ts';
import {
  AvatarUploadTicketDto,
  toAvatarUploadTicketDto,
} from '../dto/responses/avatar-upload-ticket.dto.ts';
import { CurrentUserDto, toCurrentUserDto } from '../dto/responses/current-user.dto.ts';

const routes = IdentityRoutes.me;

@ApiTags('me')
@ApiCookieAuth()
@Controller(routes.controller)
export class MeController {
  constructor(
    private readonly commands: CommandBus,
    private readonly queries: QueryBus,
  ) {}

  /** The signed-in user, read from the database (not from the token). */
  @Get()
  @ZodResponse({ status: HttpStatus.OK, type: CurrentUserDto })
  async me(@CurrentUser() user: AuthenticatedUser): Promise<CurrentUserResponse> {
    return this.current(user.id);
  }

  /**
   * Step 1 of changing the avatar: announce the picture, receive a form to POST it straight to
   * object storage. Verified emails only, so unverified accounts cannot use the bucket.
   */
  @Post(routes.avatarUploads)
  @RequireVerifiedEmail()
  @RateLimit({ limit: 20, windowSeconds: 3600 })
  @ZodResponse({ status: HttpStatus.CREATED, type: AvatarUploadTicketDto })
  async requestAvatarUpload(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: AvatarUploadDto,
  ): Promise<AvatarUploadResponse> {
    const ticket = await this.commands.execute(
      new RequestAvatarUploadCommand(user.id, body.contentType, body.size),
    );
    return toAvatarUploadTicketDto(ticket);
  }

  /** Step 2: show the uploaded picture. The file is checked before it is kept. */
  @Put(routes.avatar)
  @RequireVerifiedEmail()
  @ZodResponse({ status: HttpStatus.OK, type: CurrentUserDto })
  async changeAvatar(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: ChangeAvatarDto,
  ): Promise<CurrentUserResponse> {
    await this.commands.execute(new ChangeAvatarCommand(user.id, body.uploadId));
    return this.current(user.id);
  }

  /** Idempotent: removing an absent avatar answers the same user. */
  @Delete(routes.avatar)
  @ZodResponse({ status: HttpStatus.OK, type: CurrentUserDto })
  async removeAvatar(@CurrentUser() user: AuthenticatedUser): Promise<CurrentUserResponse> {
    await this.commands.execute(new RemoveAvatarCommand(user.id));
    return this.current(user.id);
  }

  private async current(userId: string): Promise<CurrentUserResponse> {
    return toCurrentUserDto(await this.queries.execute(new GetCurrentUserQuery(userId)));
  }
}
