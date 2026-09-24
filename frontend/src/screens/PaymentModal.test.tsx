import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentModal } from './PaymentModal';
import { renderWithStore, makeStore } from '../test-utils';
import { checkoutApi } from '../api/checkoutApi';
import { initialState } from '../store/checkoutSlice';
import type { Product, TransactionView } from '../api/types';

jest.mock('../api/checkoutApi');
const mockedApi = checkoutApi as jest.Mocked<typeof checkoutApi>;

const product: Product = {
  id: 'p1',
  name: 'Auriculares',
  description: 'desc',
  priceInCents: 100000,
  stock: 5,
  imageUrl: 'http://img',
};

const tx: TransactionView = {
  id: 't1',
  status: 'PENDING',
  gatewayTransactionId: null,
  productId: 'p1',
  customerId: 'c1',
  deliveryId: 'd1',
  quantity: 1,
  amountInCents: 100000,
  baseFeeInCents: 500000,
  deliveryFeeInCents: 1500000,
  totalInCents: 2100000,
  createdAt: '',
  updatedAt: '',
};

const storeWithProduct = () =>
  makeStore({
    products: { items: [product], selectedId: 'p1', loading: false, error: null },
    checkout: { ...initialState, step: 'form', productId: 'p1', quantity: 1 },
  });

const fillValidForm = async () => {
  await userEvent.type(
    screen.getByLabelText('Número de tarjeta'),
    '4242424242424242',
  );
  await userEvent.type(screen.getByLabelText('Mes (MM)'), '08');
  await userEvent.type(screen.getByLabelText('Año (YY)'), '30');
  await userEvent.type(screen.getByLabelText('CVC'), '123');
  await userEvent.type(
    screen.getByLabelText('Titular de la tarjeta'),
    'JUAN PEREZ',
  );
  await userEvent.type(screen.getByLabelText('Nombre completo'), 'Juan Perez');
  await userEvent.type(
    screen.getByLabelText('Correo electrónico'),
    'juan@example.com',
  );
  await userEvent.type(screen.getByLabelText('Teléfono'), '3001112233');
  await userEvent.type(
    screen.getByLabelText('Dirección'),
    'Calle 123 # 45-67',
  );
  await userEvent.type(screen.getByLabelText('Ciudad'), 'Bogota');
  await userEvent.type(screen.getByLabelText('Departamento'), 'Cundinamarca');
  await userEvent.type(screen.getByLabelText('Código postal'), '110111');
};

describe('PaymentModal', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows validation errors on empty submit', async () => {
    renderWithStore(<PaymentModal />, storeWithProduct());
    await userEvent.click(
      screen.getByRole('button', { name: /Continuar al resumen/i }),
    );
    expect(
      await screen.findByText('El número debe tener entre 13 y 19 dígitos'),
    ).toBeInTheDocument();
    expect(mockedApi.createTransaction).not.toHaveBeenCalled();
  });

  it('detects the card brand while typing', async () => {
    renderWithStore(<PaymentModal />, storeWithProduct());
    await userEvent.type(
      screen.getByLabelText('Número de tarjeta'),
      '4242424242424242',
    );
    expect(screen.getByLabelText('Visa')).toBeInTheDocument();
  });

  it('creates a transaction with a valid form', async () => {
    mockedApi.createTransaction.mockResolvedValue(tx);
    const store = storeWithProduct();
    renderWithStore(<PaymentModal />, store);
    await fillValidForm();
    await userEvent.click(
      screen.getByRole('button', { name: /Continuar al resumen/i }),
    );
    await waitFor(() =>
      expect(mockedApi.createTransaction).toHaveBeenCalledTimes(1),
    );
    await waitFor(() =>
      expect(store.getState().checkout.step).toBe('summary'),
    );
  });

  it('closes and resets when clicking the close button', async () => {
    const store = storeWithProduct();
    renderWithStore(<PaymentModal />, store);
    await userEvent.click(screen.getByLabelText('Cerrar'));
    expect(store.getState().checkout.step).toBe('catalog');
  });
});
