import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SummaryBackdrop } from './SummaryBackdrop';
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
  quantity: 2,
  amountInCents: 200000,
  baseFeeInCents: 500000,
  deliveryFeeInCents: 1500000,
  totalInCents: 2200000,
  createdAt: '',
  updatedAt: '',
};

const makeSummaryStore = () =>
  makeStore({
    products: { items: [product], selectedId: 'p1', loading: false, error: null },
    checkout: {
      ...initialState,
      step: 'summary',
      productId: 'p1',
      transaction: tx,
      card: {
        number: '4242424242424242',
        cvc: '123',
        expMonth: '08',
        expYear: '30',
        cardHolder: 'JUAN PEREZ',
      },
    },
  });

describe('SummaryBackdrop', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows the fee breakdown and last four digits', () => {
    renderWithStore(<SummaryBackdrop />, makeSummaryStore());
    expect(screen.getByText('Valor del producto')).toBeInTheDocument();
    expect(screen.getByText('Tarifa base')).toBeInTheDocument();
    expect(screen.getByText('Costo de envío')).toBeInTheDocument();
    expect(screen.getByText(/4242$/)).toBeInTheDocument();
  });

  it('pays the transaction when clicking pay', async () => {
    mockedApi.payTransaction.mockResolvedValue({ ...tx, status: 'APPROVED' });
    const store = makeSummaryStore();
    renderWithStore(<SummaryBackdrop />, store);
    await userEvent.click(screen.getByRole('button', { name: /Pagar/i }));
    await waitFor(() =>
      expect(mockedApi.payTransaction).toHaveBeenCalledWith('t1', {
        card: expect.objectContaining({ number: '4242424242424242' }),
      }),
    );
  });

  it('goes back to the form step', async () => {
    const store = makeSummaryStore();
    renderWithStore(<SummaryBackdrop />, store);
    await userEvent.click(screen.getByRole('button', { name: /Volver/i }));
    expect(store.getState().checkout.step).toBe('form');
  });

  it('renders nothing without a transaction', () => {
    const store = makeStore({
      products: { items: [], selectedId: null, loading: false, error: null },
      checkout: { ...initialState },
    });
    const { container } = renderWithStore(<SummaryBackdrop />, store);
    expect(container).toBeEmptyDOMElement();
  });
});
