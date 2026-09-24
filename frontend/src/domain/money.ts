/**
 * Formats an integer amount of cents (COP) as a localized currency string.
 * e.g. 34990000 -> "$ 349.900"
 */
export const formatCop = (cents: number): string => {
  const pesos = Math.round(cents / 100);
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(pesos);
};
