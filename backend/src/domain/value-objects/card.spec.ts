import { Card } from './card';

describe('Card value object', () => {
  const baseProps = {
    number: '4242424242424242', // valid Luhn VISA
    cvc: '123',
    expMonth: '08',
    expYear: '30',
    cardHolder: 'JUAN PEREZ',
  };

  it('creates a valid VISA card and exposes last four', () => {
    const result = Card.create(baseProps);
    expect(result.isOk).toBe(true);
    if (result.isOk) {
      expect(result.value.brand).toBe('VISA');
      expect(result.value.lastFour).toBe('4242');
    }
  });

  it('detects MasterCard in the 51-55 range', () => {
    const result = Card.create({ ...baseProps, number: '5555555555554444' });
    expect(result.isOk).toBe(true);
    if (result.isOk) {
      expect(result.value.brand).toBe('MASTERCARD');
    }
  });

  it('detects MasterCard in the 2221-2720 range', () => {
    // 2223000048410010 is a known valid-Luhn MasterCard test number.
    const result = Card.create({ ...baseProps, number: '2223000048410010' });
    expect(result.isOk).toBe(true);
    if (result.isOk) {
      expect(result.value.brand).toBe('MASTERCARD');
    }
  });

  it('returns UNKNOWN brand for other valid-Luhn numbers', () => {
    // 3530111333300000 (JCB) passes Luhn but is neither VISA nor MC.
    const result = Card.create({ ...baseProps, number: '3530111333300000' });
    expect(result.isOk).toBe(true);
    if (result.isOk) {
      expect(result.value.brand).toBe('UNKNOWN');
    }
  });

  it('strips spaces and dashes from the number', () => {
    const result = Card.create({
      ...baseProps,
      number: '4242 4242-4242 4242',
    });
    expect(result.isOk).toBe(true);
  });

  it('rejects numbers with wrong length', () => {
    const result = Card.create({ ...baseProps, number: '4242' });
    expect(result.isErr).toBe(true);
  });

  it('rejects numbers failing Luhn', () => {
    const result = Card.create({ ...baseProps, number: '4242424242424241' });
    expect(result.isErr).toBe(true);
  });

  it('rejects invalid cvc', () => {
    const result = Card.create({ ...baseProps, cvc: '12' });
    expect(result.isErr).toBe(true);
  });

  it('rejects invalid month', () => {
    const result = Card.create({ ...baseProps, expMonth: '13' });
    expect(result.isErr).toBe(true);
  });

  it('rejects malformed year', () => {
    const result = Card.create({ ...baseProps, expYear: '2030' });
    expect(result.isErr).toBe(true);
  });

  it('rejects an expired card', () => {
    const result = Card.create({ ...baseProps, expMonth: '01', expYear: '20' });
    expect(result.isErr).toBe(true);
  });

  it('rejects a too-short card holder name', () => {
    const result = Card.create({ ...baseProps, cardHolder: 'ab' });
    expect(result.isErr).toBe(true);
  });

  it('passesLuhn works as a static helper', () => {
    expect(Card.passesLuhn('4242424242424242')).toBe(true);
    expect(Card.passesLuhn('1234567890123456')).toBe(false);
  });
});
