import { Injectable } from '@nestjs/common';
import type { User } from '@template/identity-domain';

import { AvatarStorage } from '../ports/storage/avatar-storage.port.ts';
import { toCurrentUserView, type CurrentUserView } from '../views/current-user.view.ts';

/** Builds the signed-in user's view, resolving the Avatar to a URL the browser can display. */
@Injectable()
export class CurrentUserViews {
  constructor(private readonly avatars: AvatarStorage) {}

  async of(user: User): Promise<CurrentUserView> {
    const avatarUrl = user.avatarKey ? await this.avatars.urlOf(user.avatarKey) : null;
    return toCurrentUserView(user, avatarUrl);
  }
}
