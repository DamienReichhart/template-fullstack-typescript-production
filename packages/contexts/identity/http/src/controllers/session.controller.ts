import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { AuthCookies, CommonErrorCode } from '@template/contracts/common';
import { IdentityRoutes, type CurrentUserResponse } from '@template/contracts/identity';
import { ApiProblemException, RateLimit, ZodResponse } from '@template/http';
import {
  LoginCommand,
  LogoutCommand,
  RefreshSessionCommand,
  type ClientInfo,
} from '@template/identity-application';
import {
  RefreshTokenReuseDetectedError,
  SessionExpiredError,
  SessionRevokedError,
} from '@template/identity-domain';
import type { Request, Response } from 'express';

import { AuthCookiesService } from '../cookies/auth-cookies.service.js';
import { Client } from '../decorators/client-info.decorator.js';
import { Public } from '../decorators/public.decorator.js';
import { LoginDto } from '../dto/requests/login.dto.js';
import { CurrentUserDto, toCurrentUserDto } from '../dto/responses/current-user.dto.js';

const routes = IdentityRoutes.auth;
const refreshCookie = (request: Request) =>
  (request.cookies as Record<string, string> | undefined)?.[AuthCookies.refreshToken];

@ApiTags('auth')
@Controller(routes.controller)
export class SessionController {
  constructor(
    private readonly commands: CommandBus,
    private readonly cookies: AuthCookiesService,
  ) {}

  /** Issues the readable CSRF cookie every state-changing request must echo. */
  @Public()
  @Get(routes.csrf)
  @HttpCode(HttpStatus.NO_CONTENT)
  csrf(@Res({ passthrough: true }) response: Response): void {
    this.cookies.issueCsrfToken(response);
  }

  @Public()
  @Post(routes.login)
  @HttpCode(HttpStatus.OK)
  @RateLimit({ limit: 10, windowSeconds: 60 })
  @ZodResponse({ status: HttpStatus.OK, type: CurrentUserDto })
  async login(
    @Body() body: LoginDto,
    @Client() client: ClientInfo,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CurrentUserResponse> {
    const session = await this.commands.execute(
      new LoginCommand(body.email, body.password, client),
    );
    this.cookies.setSession(response, session);
    return toCurrentUserDto(session.user);
  }

  /** Rotates the refresh token. Dead sessions also get their cookies cleared. */
  @Public()
  @Post(routes.refresh)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: CurrentUserDto })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CurrentUserResponse> {
    const refreshToken = refreshCookie(request);
    if (!refreshToken)
      throw new ApiProblemException(HttpStatus.UNAUTHORIZED, CommonErrorCode.unauthenticated);
    try {
      const session = await this.commands.execute(new RefreshSessionCommand(refreshToken));
      this.cookies.setSession(response, session);
      return toCurrentUserDto(session.user);
    } catch (error) {
      const sessionIsDead =
        error instanceof SessionRevokedError ||
        error instanceof SessionExpiredError ||
        error instanceof RefreshTokenReuseDetectedError;
      if (sessionIsDead) this.cookies.clearSession(response);
      throw error;
    }
  }

  @Public()
  @Post(routes.logout)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.commands.execute(new LogoutCommand(refreshCookie(request)));
    this.cookies.clearSession(response);
  }
}
