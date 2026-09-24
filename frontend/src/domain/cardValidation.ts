export type CardBrand = 'VISA' | 'MASTERCARD' | 'UNKNOWN';

/** Removes spaces and dashes, keeping only digits. */
export const sanitizeCardNumber = (value: string): string =>
  value.replace(/[\s-]/g, '');

/** Luhn (mod 10) checksum used by all major card networks. */
export const passesLuhn = (number: string): boolean => {
  if (!/^\d+$/.test(number)) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = Number(number[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

export const detectBrand = (rawNumber: string): CardBrand => {
  const number = sanitizeCardNumber(rawNumber);
  if (/^4/.test(number)) return 'VISA';
  if (/^5[1-5]/.test(number)) return 'MASTERCARD';
  const firstFour = Number(number.slice(0, 4));
  if (firstFour >= 2221 && firstFour <= 2720) return 'MASTERCARD';
  return 'UNKNOWN';
};

/** Formats the card number in groups of 4 for display. */
export const formatCardNumber = (value: string): string => {
  const digits = sanitizeCardNumber(value).slice(0, 19);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

export interface CardFormValues {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
}

export type CardFieldErrors = Partial<Record<keyof CardFormValues, string>>;

const isExpired = (month: number, twoDigitYear: number): boolean => {
  const fullYear = 2000 + twoDigitYear;
  const now = new Date();
  if (fullYear < now.getFullYear()) return true;
  if (fullYear === now.getFullYear() && month < now.getMonth() + 1) return true;
  return false;
};

/**
 * Validates the whole card form and returns a map of field -> error message.
 * An empty object means the form is valid.
 */
export const validateCard = (values: CardFormValues): CardFieldErrors => {
  const errors: CardFieldErrors = {};
  const number = sanitizeCardNumber(values.number);

  if (!/^\d{13,19}$/.test(number)) {
    errors.number = 'El número debe tener entre 13 y 19 dígitos';
  } else if (!passesLuhn(number)) {
    errors.number = 'Número de tarjeta inválido';
  }

  if (!/^\d{3,4}$/.test(values.cvc)) {
    errors.cvc = 'CVC inválido';
  }

  const month = Number(values.expMonth);
  if (!/^\d{1,2}$/.test(values.expMonth) || month < 1 || month > 12) {
    errors.expMonth = 'Mes inválido';
  }

  if (!/^\d{2}$/.test(values.expYear)) {
    errors.expYear = 'Año inválido (YY)';
  } else if (!errors.expMonth && isExpired(month, Number(values.expYear))) {
    errors.expYear = 'La tarjeta está vencida';
  }

  if (values.cardHolder.trim().length < 3) {
    errors.cardHolder = 'Nombre del titular requerido';
  }

  return errors;
};
