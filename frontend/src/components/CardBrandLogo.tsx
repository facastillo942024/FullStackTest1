import type { CardBrand } from '../domain/cardValidation';

interface Props {
  brand: CardBrand;
}

/** Small inline SVG badges for the detected card franchise. */
export function CardBrandLogo({ brand }: Props) {
  if (brand === 'VISA') {
    return (
      <span className="brand-logo brand-visa" aria-label="Visa" role="img">
        <svg viewBox="0 0 48 16" width="42" height="14">
          <text
            x="0"
            y="13"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
            fontStyle="italic"
            fontSize="15"
            fill="#1a1f71"
          >
            VISA
          </text>
        </svg>
      </span>
    );
  }

  if (brand === 'MASTERCARD') {
    return (
      <span
        className="brand-logo brand-mastercard"
        aria-label="MasterCard"
        role="img"
      >
        <svg viewBox="0 0 40 24" width="34" height="20">
          <circle cx="15" cy="12" r="10" fill="#eb001b" />
          <circle cx="25" cy="12" r="10" fill="#f79e1b" opacity="0.85" />
        </svg>
      </span>
    );
  }

  return null;
}
