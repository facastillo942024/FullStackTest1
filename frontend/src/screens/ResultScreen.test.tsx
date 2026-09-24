import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultScreen } from './ResultScreen';
import { renderWithStore, makeStore } from '../test-utils';
import { checkoutApi } from '../api/checkoutApi';
import { initialState } from '../store/checkoutSlice';
import type { TransactionView, TransactionStatus } from '../api/types';

jest.mock('../api/checkoutApi');
const mockedApi = checkoutApi as jest.Mocked<typeof checkoutApi>;

const makeTx = (status: TransactionStatus): TransactionView => ({
  id: 't1',
  status,
  gatewayTransactionId: status === 'APPROVED' ? 'gw-1' : null,
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
});

const makeResultStore = (status: TransactionStatus, error: string | null = null) =>
  makeStore({
    products: { items: [], selectedId: null, loading: false, error: null },
    checkout: {
      ...initialState,
      step: 'result',
      transaction: makeTx(status),
      error,
    },
  });

describe('ResultScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows the approved result with gateway reference', () => {
    renderWithStore(<ResultScreen />, makeResultStore('APPROVED'));
    expect(screen.getByText('¡Pago aprobado!')).toBeInTheDocument();
    expect(screen.getByText('gw-1')).toBeInTheDocument();
  });

  it('shows the declined result', () => {
    renderWithStore(<ResultScreen />, makeResultStore('DECLINED'));
    expect(screen.getByText('Pago rechazado')).toBeInTheDocument();
  });

  it('shows the error result with detail', () => {
    renderWithStore(<ResultScreen />, makeResultStore('ERROR', 'gateway down'));
    expect(screen.getByText('Error en el pago')).toBeInTheDocument();
    expect(screen.getByText('gateway down')).toBeInTheDocument();
  });

  it('returns to catalog and refreshes products', async () => {
    mockedApi.getProducts.mockResolvedValue([]);
    const store = makeResultStore('APPROVED');
    renderWithStore(<ResultScreen />, store);
    await userEvent.click(
      screen.getByRole('button', { name: /Volver a la tienda/i }),
    );
    await waitFor(() =>
      expect(store.getState().checkout.step).toBe('catalog'),
    );
    expect(mockedApi.getProducts).toHaveBeenCalled();
  });
});
