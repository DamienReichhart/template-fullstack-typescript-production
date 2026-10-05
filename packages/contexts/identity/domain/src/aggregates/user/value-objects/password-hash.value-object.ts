import { ValueObject } from '@template/ddd';

/** The output of the password hasher. The domain never sees, stores or compares plain passwords. */
export class PasswordHash extends ValueObject<{ value: string }> {
  static fromHash(value: string): PasswordHash {
    return new PasswordHash({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
