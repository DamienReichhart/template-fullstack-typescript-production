import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import { UserId, UserNotFoundError, UserRepository } from '@template/identity-domain';

import { CurrentUserViews } from '../../services/current-user-views.service.ts';
import type { CurrentUserView } from '../../views/current-user.view.ts';
import { GetCurrentUserQuery } from './get-current-user.query.ts';

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler implements IQueryHandler<GetCurrentUserQuery, CurrentUserView> {
  constructor(
    private readonly users: UserRepository,
    private readonly views: CurrentUserViews,
  ) {}

  async execute({ userId }: GetCurrentUserQuery): Promise<CurrentUserView> {
    const user = await this.users.findById(UserId.from(userId));
    if (!user) throw new UserNotFoundError(userId);
    return this.views.of(user);
  }
}
