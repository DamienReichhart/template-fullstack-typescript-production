import { Identifier } from '@template/ddd';

export class SessionId extends Identifier {
  static create(): SessionId {
    return new SessionId(Identifier.newValue());
  }

  static from(value: string): SessionId {
    return new SessionId(Identifier.assertValid(value));
  }
}
