import { Result, ok, err } from '../result/result';
import { InvalidCardError } from '../errors/domain-error';

export type CardBrand = 'VISA' | 'MASTERCARD' | 'UNKNOWN';

export interface CardProps {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
}

/**
 * Value object encapsulating credit card validation logic:
 * - Luhn checksum for the card number.
 * - Brand detection (VISA / MasterCard).
 * - Basic expiration and CVC structural checks.
 *
 * Note: this never stores or logs the full PAN beyond what is required to
 * forward to the payment gateway; the HTTP layer only receives the last four
 * digits and brand.
 */
export class Card {
  private constructor(
    public readonly number: string,
    public readonly cvc: string,
    public readonly expMonth: string,
    public readonly expYear: string,
    public readonly cardHolder: string,
    public readonly brand: CardBrand,
  ) {}

  static create(props: CardProps): Result<Card, InvalidCardError> {
    const sanitized = props.number.replace(/[\s-]/g, '');

    if (!/^\d{13,19}$/.test(sanitized)) {
      return err(new InvalidCardError('card number must be 13-19 digits'));
    }

    if (!Card.passesLuhn(sanitized)) {
      return err(new InvalidCardError('card number failed Luhn validation'));
    }

    if (!/^\d{3,4}$/.test(props.cvc)) {
      return err(new InvalidCardError('cvc must be 3 or 4 digits'));
    }

    const monthNum = Number(props.expMonth);
    if (!/^\d{1,2}$/.test(props.expMonth) || monthNum < 1 || monthNum > 12) {
      return err(new InvalidCardError('expiration month is invalid'));
    }

    if (!/^\d{2}$/.test(props.expYear)) {
      return err(new InvalidCardError('expiration year must be 2 digits (YY)'));
    }

    if (Card.isExpired(monthNum, Number(props.expYear))) {
      return err(new InvalidCardError('card is expired'));
    }

    if (props.cardHolder.trim().length < 3) {
      return err(new InvalidCardError('card holder name is too short'));
    }

    const brand = Card.detectBrand(sanitized);

    return ok(
      new Card(
        sanitized,
        props.cvc,
        props.expMonth.padStart(2, '0'),
        props.expYear,
        props.cardHolder.trim(),
        brand,
      ),
    );
  }

  get lastFour(): string {
    return this.number.slice(-4);
  }

  /** Luhn (mod 10) checksum used by all major card networks. */
  static passesLuhn(number: string): boolean {
    let sum = 0;
    let shouldDouble = false;
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = Number(number[i]);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }

  static detectBrand(number: string): CardBrand {
    // VISA: starts with 4
    if (/^4/.test(number)) {
      return 'VISA';
    }
    // MasterCard: 51-55 or 2221-2720
    if (/^5[1-5]/.test(number)) {
      return 'MASTERCARD';
    }
    const firstFour = Number(number.slice(0, 4));
    if (firstFour >= 2221 && firstFour <= 2720) {
      return 'MASTERCARD';
    }
    return 'UNKNOWN';
  }

  private static isExpired(month: number, twoDigitYear: number): boolean {
    const fullYear = 2000 + twoDigitYear;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    if (fullYear < currentYear) {
      return true;
    }
    if (fullYear === currentYear && month < currentMonth) {
      return true;
    }
    return false;
  }
}
