import { render, screen } from '@testing-library/react';
import { ProcessingScreen } from './ProcessingScreen';

describe('ProcessingScreen', () => {
  it('shows a processing message', () => {
    render(<ProcessingScreen />);
    expect(screen.getByRole('status')).toHaveTextContent(/Procesando tu pago/i);
  });
});
