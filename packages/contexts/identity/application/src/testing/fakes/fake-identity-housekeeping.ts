import { IdentityHousekeeping } from '../../ports/maintenance/identity-housekeeping.port.ts';

/** Records the housekeeping identity asked for; runs none of it. */
export class FakeIdentityHousekeeping extends IdentityHousekeeping {
  readonly avatarFilesToDelete: string[] = [];

  async deleteAvatarFile(avatarKey: string): Promise<void> {
    this.avatarFilesToDelete.push(avatarKey);
  }
}
