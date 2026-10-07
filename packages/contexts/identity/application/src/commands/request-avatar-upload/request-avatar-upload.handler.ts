import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { AvatarImage, UserId, UserNotFoundError, UserRepository } from '@template/identity-domain';

import { AvatarStorage, type AvatarUploadTicket } from '../../ports/storage/avatar-storage.port.ts';
import { RequestAvatarUploadCommand } from './request-avatar-upload.command.ts';

/** Checks the announced picture against the Avatar rules, then lets the browser send it. */
@CommandHandler(RequestAvatarUploadCommand)
export class RequestAvatarUploadHandler implements ICommandHandler<
  RequestAvatarUploadCommand,
  AvatarUploadTicket
> {
  constructor(
    private readonly users: UserRepository,
    private readonly avatars: AvatarStorage,
  ) {}

  async execute({
    userId,
    contentType,
    size,
  }: RequestAvatarUploadCommand): Promise<AvatarUploadTicket> {
    const image = AvatarImage.create(contentType, size);
    if (!(await this.users.findById(UserId.from(userId)))) throw new UserNotFoundError(userId);
    return this.avatars.issueUpload(userId, image);
  }
}
