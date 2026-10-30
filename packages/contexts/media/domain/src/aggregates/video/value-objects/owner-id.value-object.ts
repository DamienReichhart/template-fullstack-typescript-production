import { Identifier } from '@template/ddd';

/** The User who uploaded a Video. Known by id only: media never reads identity's Users. */
export class OwnerId extends Identifier {
  static from(value: string): OwnerId {
    return new OwnerId(Identifier.assertValid(value));
  }
}
