import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import { AvatarStorage } from '../../ports/storage/avatar-storage.port.ts';
import { DeleteAvatarFileCommand } from './delete-avatar-file.command.ts';

@CommandHandler(DeleteAvatarFileCommand)
export class DeleteAvatarFileHandler implements ICommandHandler<DeleteAvatarFileCommand, void> {
  constructor(private readonly avatars: AvatarStorage) {}

  async execute({ avatarKey }: DeleteAvatarFileCommand): Promise<void> {
    await this.avatars.delete(avatarKey);
  }
}
