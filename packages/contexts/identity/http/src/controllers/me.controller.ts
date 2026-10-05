import { Controller, Get, HttpStatus } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { IdentityRoutes, type CurrentUserResponse } from '@template/contracts/identity';
import { ZodResponse } from '@template/http';
import { GetCurrentUserQuery } from '@template/identity-application';

import { CurrentUser, type AuthenticatedUser } from '../decorators/current-user.decorator.js';
import { CurrentUserDto, toCurrentUserDto } from '../dto/responses/current-user.dto.js';

@ApiTags('me')
@ApiCookieAuth()
@Controller(IdentityRoutes.me.controller)
export class MeController {
  constructor(private readonly queries: QueryBus) {}

  /** The signed-in user, read from the database (not from the token). */
  @Get()
  @ZodResponse({ status: HttpStatus.OK, type: CurrentUserDto })
  async me(@CurrentUser() user: AuthenticatedUser): Promise<CurrentUserResponse> {
    return toCurrentUserDto(await this.queries.execute(new GetCurrentUserQuery(user.id)));
  }
}
