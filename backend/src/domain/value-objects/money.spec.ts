import { Money } from './money';

describe('Money value object', () => {
  it('creates from valid cents', () => {
    const result = Money.fromCents(1500);
    expect(result.isOk).toBe(true);
    if (result.isOk) {
      expect(result.value.cents).toBe(1500);
      expect(result.value.toString()).toBe('15.00');
    }
  });

  it('rejects non-integer cents', () => {
    expect(Money.fromCents(10.5).isErr).toBe(true);
  });

  it('rejects negative cents', () => {
    expect(Money.fromCents(-1).isErr).toBe(true);
  });

  it('adds two money values', () => {
    const a = Money.fromCents(100);
    const b = Money.fromCents(250);
    if (a.isOk && b.isOk) {
      expect(a.value.add(b.value).cents).toBe(350);
    }
  });

  it('compares equality', () => {
    const a = Money.fromCents(100);
    const b = Money.fromCents(100);
    const c = Money.fromCents(101);
    if (a.isOk && b.isOk && c.isOk) {
      expect(a.value.equals(b.value)).toBe(true);
      expect(a.value.equals(c.value)).toBe(false);
    }
  });
});
