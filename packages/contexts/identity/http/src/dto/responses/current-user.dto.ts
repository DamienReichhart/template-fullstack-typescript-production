import { currentUserResponseSchema, type CurrentUserResponse } from '@template/contracts/identity';
import { createZodDto } from '@template/http';
import type { CurrentUserView } from '@template/identity-application';

export class CurrentUserDto extends createZodDto(currentUserResponseSchema) {}

export function toCurrentUserDto(view: CurrentUserView): CurrentUserResponse {
  return { ...view, createdAt: view.createdAt.toISOString() };
}
