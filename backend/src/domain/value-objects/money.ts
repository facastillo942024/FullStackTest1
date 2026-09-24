import { Result, ok, err } from '../result/result';
import { ValidationError } from '../errors/domain-error';

/**
 * Represents a monetary amount stored as an integer number of cents to avoid
 * floating point rounding issues.
 */
export class Money {
  private constructor(public readonly cents: number) {}

  static fromCents(cents: number): Result<Money, ValidationError> {
    if (!Number.isInteger(cents)) {
      return err(new ValidationError('amount in cents must be an integer'));
    }
    if (cents < 0) {
      return err(new ValidationError('amount in cents cannot be negative'));
    }
    return ok(new Money(cents));
  }

  add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  equals(other: Money): boolean {
    return this.cents === other.cents;
  }

  toString(): string {
    return (this.cents / 100).toFixed(2);
  }
}
