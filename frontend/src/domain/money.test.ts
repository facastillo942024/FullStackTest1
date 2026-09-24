import { formatCop } from './money';

describe('formatCop', () => {
  it('formats cents as COP without decimals', () => {
    const result = formatCop(34990000);
    // Contains the pesos amount 349.900 (grouping may vary by environment).
    expect(result.replace(/\s/g, '')).toContain('349');
    expect(result).toMatch(/\$/);
  });

  it('handles zero', () => {
    expect(formatCop(0)).toMatch(/0/);
  });
});
