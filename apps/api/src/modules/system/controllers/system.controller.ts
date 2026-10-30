import { Controller, Get, HttpStatus } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import {
  SystemRoutes,
  type AuthenticatedPingResponse,
  type PingResponse,
} from '@template/contracts/system';
import {
  CurrentUser,
  Public,
  RequireVerifiedEmail,
  ZodResponse,
  type AuthenticatedUser,
} from '@template/http';
import { GetCurrentUserQuery } from '@template/identity-application';

import { AuthenticatedPingDto, PingDto } from '../dto/ping.dto.ts';
import { SystemStatusService } from '../services/system-status.service.ts';

const routes = SystemRoutes.system;

@ApiTags('system')
@Controller(routes.controller)
export class SystemController {
  constructor(
    private readonly status: SystemStatusService,
    private readonly queries: QueryBus,
  ) {}

  /** Public connectivity check: api version, uptime, database and Redis status. */
  @Public()
  @Get(routes.ping)
  @ZodResponse({ status: HttpStatus.OK, type: PingDto })
  ping(): Promise<PingResponse> {
    return this.status.ping();
  }

  /** Proves the cookie session round-trip; requires a verified email. */
  @Get(routes.authenticatedPing)
  @RequireVerifiedEmail()
  @ZodResponse({ status: HttpStatus.OK, type: AuthenticatedPingDto })
  async authenticatedPing(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AuthenticatedPingResponse> {
    const current = await this.queries.execute(new GetCurrentUserQuery(user.id));
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      user: { id: current.id, email: current.email, role: current.role },
    };
  }
}
