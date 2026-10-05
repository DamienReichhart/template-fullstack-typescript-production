import {
  EmailAlreadyTakenError,
  UserRepository,
  type Email,
  type User,
  type UserId,
} from '@template/identity-domain';

export class InMemoryUserRepository extends UserRepository {
  readonly users = new Map<string, User>();

  async findById(id: UserId): Promise<User | null> {
    return this.users.get(id.value) ?? null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    return [...this.users.values()].find((user) => user.email.equals(email)) ?? null;
  }

  async existsByEmail(email: Email): Promise<boolean> {
    return (await this.findByEmail(email)) !== null;
  }

  async save(user: User): Promise<void> {
    const sameEmail = await this.findByEmail(user.email);
    if (sameEmail && !sameEmail.id.equals(user.id)) throw new EmailAlreadyTakenError();
    this.users.set(user.id.value, user);
  }
}
