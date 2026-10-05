import { Query } from '@nestjs/cqrs';

import type { CurrentUserView } from '../../views/current-user.view.ts';

export class GetCurrentUserQuery extends Query<CurrentUserView> {
  constructor(readonly userId: string) {
    super();
  }
}
