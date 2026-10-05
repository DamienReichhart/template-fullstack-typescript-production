import type { User } from '../user.aggregate.js';
import type { Email } from '../value-objects/email.value-object.js';
import type { UserId } from '../value-objects/user-id.value-object.js';

/** Port: implemented in the infrastructure layer, faked in application tests. */
export abstract class UserRepository {
  abstract findById(id: UserId): Promise<User | null>;
  abstract findByEmail(email: Email): Promise<User | null>;
  abstract existsByEmail(email: Email): Promise<boolean>;
  abstract save(user: User): Promise<void>;
}
