import { Identifier } from '@template/ddd';

export class OneTimeTokenId extends Identifier {
  static create(): OneTimeTokenId {
    return new OneTimeTokenId(Identifier.newValue());
  }

  static from(value: string): OneTimeTokenId {
    return new OneTimeTokenId(Identifier.assertValid(value));
  }
}
