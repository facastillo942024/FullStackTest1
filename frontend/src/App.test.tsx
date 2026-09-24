import { screen } from '@testing-library/react';
import App from './App';
import { renderWithStore, makeStore } from './test-utils';
import { checkoutApi } from './api/checkoutApi';
import { initialState } from './store/checkoutSlice';
import type { TransactionView } from './api/types';

jest.mock('./api/checkoutApi');
const mockedApi = checkoutApi as jest.Mocked<typeof checkoutApi>;

const tx: TransactionView = {
  id: 't1',
  status: 'APPROVED',
  gatewayTransactionId: 'gw-1',
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

const baseProducts = {
  items: [],
  selectedId: null,
  loading: false,
  error: null,
};

describe('App step routing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedApi.getProducts.mockResolvedValue([]);
  });

  it('renders only the catalog on the catalog step', () => {
    renderWithStore(<App />, makeStore());
    expect(screen.getByText('Tienda Tech')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('overlays the processing screen', () => {
    const store = makeStore({
      products: baseProducts,
      checkout: { ...initialState, step: 'processing' },
    });
    renderWithStore(<App />, store);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('overlays the result screen', () => {
    const store = makeStore({
      products: baseProducts,
      checkout: { ...initialState, step: 'result', transaction: tx },
    });
    renderWithStore(<App />, store);
    expect(screen.getByText('¡Pago aprobado!')).toBeInTheDocument();
  });
});
