import { ValueObject } from '@template/ddd';

/** Digest of a refresh token. The token itself only ever exists in the user's cookie. */
export class RefreshTokenHash extends ValueObject<{ value: string }> {
  static fromHash(value: string): RefreshTokenHash {
    return new RefreshTokenHash({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
