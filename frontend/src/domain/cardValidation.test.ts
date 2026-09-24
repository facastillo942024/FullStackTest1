import {
  passesLuhn,
  detectBrand,
  sanitizeCardNumber,
  formatCardNumber,
  validateCard,
} from './cardValidation';

describe('cardValidation', () => {
  describe('sanitizeCardNumber', () => {
    it('removes spaces and dashes', () => {
      expect(sanitizeCardNumber('4242 4242-4242 4242')).toBe(
        '4242424242424242',
      );
    });
  });

  describe('passesLuhn', () => {
    it('accepts a valid number', () => {
      expect(passesLuhn('4242424242424242')).toBe(true);
    });
    it('rejects an invalid number', () => {
      expect(passesLuhn('4242424242424241')).toBe(false);
    });
    it('rejects non-digits', () => {
      expect(passesLuhn('42a2')).toBe(false);
    });
  });

  describe('detectBrand', () => {
    it('detects VISA', () => {
      expect(detectBrand('4242424242424242')).toBe('VISA');
    });
    it('detects MasterCard 51-55', () => {
      expect(detectBrand('5555555555554444')).toBe('MASTERCARD');
    });
    it('detects MasterCard 2221-2720', () => {
      expect(detectBrand('2223000048410010')).toBe('MASTERCARD');
    });
    it('returns UNKNOWN otherwise', () => {
      expect(detectBrand('3530111333300000')).toBe('UNKNOWN');
    });
  });

  describe('formatCardNumber', () => {
    it('groups digits in blocks of four', () => {
      expect(formatCardNumber('4242424242424242')).toBe(
        '4242 4242 4242 4242',
      );
    });
    it('caps at 19 digits', () => {
      expect(formatCardNumber('1'.repeat(25)).replace(/\s/g, '')).toHaveLength(
        19,
      );
    });
  });

  describe('validateCard', () => {
    const valid = {
      number: '4242424242424242',
      cvc: '123',
      expMonth: '08',
      expYear: '30',
      cardHolder: 'JUAN PEREZ',
    };

    it('passes with valid data', () => {
      expect(validateCard(valid)).toEqual({});
    });
    it('fails on bad number length', () => {
      expect(validateCard({ ...valid, number: '4242' }).number).toBeDefined();
    });
    it('fails on Luhn', () => {
      expect(
        validateCard({ ...valid, number: '4242424242424241' }).number,
      ).toBeDefined();
    });
    it('fails on bad cvc', () => {
      expect(validateCard({ ...valid, cvc: '1' }).cvc).toBeDefined();
    });
    it('fails on bad month', () => {
      expect(validateCard({ ...valid, expMonth: '13' }).expMonth).toBeDefined();
    });
    it('fails on bad year format', () => {
      expect(
        validateCard({ ...valid, expYear: '2030' }).expYear,
      ).toBeDefined();
    });
    it('fails on expired card', () => {
      expect(
        validateCard({ ...valid, expMonth: '01', expYear: '20' }).expYear,
      ).toBeDefined();
    });
    it('fails on short holder', () => {
      expect(
        validateCard({ ...valid, cardHolder: 'ab' }).cardHolder,
      ).toBeDefined();
    });
  });
});
