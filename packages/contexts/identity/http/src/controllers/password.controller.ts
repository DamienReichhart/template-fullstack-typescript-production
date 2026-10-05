import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { IdentityRoutes } from '@template/contracts/identity';
import { Public, RateLimit } from '@template/http';
import { RequestPasswordResetCommand, ResetPasswordCommand } from '@template/identity-application';
import type { Response } from 'express';

import { AuthCookiesService } from '../cookies/auth-cookies.service.ts';
import { ForgotPasswordDto } from '../dto/requests/forgot-password.dto.ts';
import { ResetPasswordDto } from '../dto/requests/reset-password.dto.ts';

const routes = IdentityRoutes.auth;

@ApiTags('auth')
@Controller(routes.controller)
export class PasswordController {
  constructor(
    private readonly commands: CommandBus,
    private readonly cookies: AuthCookiesService,
  ) {}

  /** Always 202, whether the email exists or not. */
  @Public()
  @Post(routes.forgotPassword)
  @HttpCode(HttpStatus.ACCEPTED)
  @RateLimit({ limit: 5, windowSeconds: 900 })
  async forgotPassword(@Body() body: ForgotPasswordDto): Promise<void> {
    await this.commands.execute(new RequestPasswordResetCommand(body.email));
  }

  /** Every session of the user is revoked, including the caller's. */
  @Public()
  @Post(routes.resetPassword)
  @HttpCode(HttpStatus.NO_CONTENT)
  @RateLimit({ limit: 10, windowSeconds: 900 })
  async resetPassword(
    @Body() body: ResetPasswordDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.commands.execute(new ResetPasswordCommand(body.token, body.password));
    this.cookies.clearSession(response);
  }
}
