import { Identifier } from '@template/ddd';

export class UserId extends Identifier {
  static create(): UserId {
    return new UserId(Identifier.newValue());
  }

  static from(value: string): UserId {
    return new UserId(Identifier.assertValid(value));
  }
}
