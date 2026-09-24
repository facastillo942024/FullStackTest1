import { render, screen } from '@testing-library/react';
import { Field } from './Field';

describe('Field', () => {
  it('renders label and input', () => {
    render(<Field name="email" label="Correo" />);
    expect(screen.getByLabelText('Correo')).toBeInTheDocument();
  });

  it('shows an error message and marks input invalid', () => {
    render(<Field name="email" label="Correo" error="Requerido" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Requerido');
    expect(screen.getByLabelText('Correo')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('renders the right slot', () => {
    render(
      <Field name="n" label="N" rightSlot={<span>slot</span>} />,
    );
    expect(screen.getByText('slot')).toBeInTheDocument();
  });
});
