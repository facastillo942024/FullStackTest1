import { render, screen } from '@testing-library/react';
import { CardBrandLogo } from './CardBrandLogo';

describe('CardBrandLogo', () => {
  it('renders Visa badge', () => {
    render(<CardBrandLogo brand="VISA" />);
    expect(screen.getByLabelText('Visa')).toBeInTheDocument();
  });

  it('renders MasterCard badge', () => {
    render(<CardBrandLogo brand="MASTERCARD" />);
    expect(screen.getByLabelText('MasterCard')).toBeInTheDocument();
  });

  it('renders nothing for UNKNOWN', () => {
    const { container } = render(<CardBrandLogo brand="UNKNOWN" />);
    expect(container).toBeEmptyDOMElement();
  });
});
