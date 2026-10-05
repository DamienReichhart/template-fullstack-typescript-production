import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { IdentityRoutes, type CurrentUserResponse } from '@template/contracts/identity';
import { RateLimit, ZodResponse } from '@template/http';
import {
  RegisterUserCommand,
  ResendEmailVerificationCommand,
  VerifyEmailCommand,
  type ClientInfo,
} from '@template/identity-application';
import type { Response } from 'express';

import { AuthCookiesService } from '../cookies/auth-cookies.service.js';
import { Client } from '../decorators/client-info.decorator.js';
import { Public } from '../decorators/public.decorator.js';
import { RegisterDto } from '../dto/requests/register.dto.js';
import { ResendVerificationDto } from '../dto/requests/resend-verification.dto.js';
import { VerifyEmailDto } from '../dto/requests/verify-email.dto.js';
import { CurrentUserDto, toCurrentUserDto } from '../dto/responses/current-user.dto.js';

const routes = IdentityRoutes.auth;

@ApiTags('auth')
@Controller(routes.controller)
export class RegistrationController {
  constructor(
    private readonly commands: CommandBus,
    private readonly cookies: AuthCookiesService,
  ) {}

  /** Creates the account and signs the user in. Onboarding emails are sent asynchronously. */
  @Public()
  @Post(routes.register)
  @RateLimit({ limit: 5, windowSeconds: 60 })
  @ZodResponse({ status: HttpStatus.CREATED, type: CurrentUserDto })
  async register(
    @Body() body: RegisterDto,
    @Client() client: ClientInfo,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CurrentUserResponse> {
    const session = await this.commands.execute(
      new RegisterUserCommand(body.name, body.email, body.password, body.locale, client),
    );
    this.cookies.setSession(response, session);
    return toCurrentUserDto(session.user);
  }

  @Public()
  @Post(routes.verifyEmail)
  @HttpCode(HttpStatus.NO_CONTENT)
  async verifyEmail(@Body() body: VerifyEmailDto): Promise<void> {
    await this.commands.execute(new VerifyEmailCommand(body.token));
  }

  /** Always 202, whether the email exists or not. */
  @Public()
  @Post(routes.resendVerification)
  @HttpCode(HttpStatus.ACCEPTED)
  @RateLimit({ limit: 3, windowSeconds: 300 })
  async resendVerification(@Body() body: ResendVerificationDto): Promise<void> {
    await this.commands.execute(new ResendEmailVerificationCommand(body.email));
  }
}
