import reducer, {
  startCheckout,
  setQuantity,
  setCustomer,
  setDelivery,
  setCard,
  goToStep,
  resetCheckout,
  clearError,
  createTransaction,
  payTransaction,
  initialState,
} from './checkoutSlice';
import type { TransactionView } from '../api/types';

const tx: TransactionView = {
  id: 't1',
  status: 'PENDING',
  gatewayTransactionId: null,
  productId: 'p1',
  customerId: 'c1',
  deliveryId: 'd1',
  quantity: 2,
  amountInCents: 2000,
  baseFeeInCents: 500,
  deliveryFeeInCents: 1500,
  totalInCents: 4000,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('checkoutSlice reducers', () => {
  it('startCheckout moves to form step', () => {
    const state = reducer(
      initialState,
      startCheckout({ productId: 'p1', quantity: 3 }),
    );
    expect(state.step).toBe('form');
    expect(state.productId).toBe('p1');
    expect(state.quantity).toBe(3);
  });

  it('setQuantity clamps to at least 1', () => {
    expect(reducer(initialState, setQuantity(0)).quantity).toBe(1);
    expect(reducer(initialState, setQuantity(4)).quantity).toBe(4);
  });

  it('setCustomer / setDelivery / setCard store data', () => {
    let state = reducer(
      initialState,
      setCustomer({ fullName: 'A', email: 'a@e.com', phoneNumber: '1' }),
    );
    state = reducer(
      state,
      setDelivery({
        addressLine: 'x',
        city: 'y',
        region: 'z',
        postalCode: '1',
      }),
    );
    state = reducer(
      state,
      setCard({
        number: '4242',
        cvc: '123',
        expMonth: '08',
        expYear: '30',
        cardHolder: 'A',
      }),
    );
    expect(state.customer.fullName).toBe('A');
    expect(state.delivery.city).toBe('y');
    expect(state.card.number).toBe('4242');
  });

  it('goToStep changes the step', () => {
    expect(reducer(initialState, goToStep('summary')).step).toBe('summary');
  });

  it('resetCheckout returns to initial', () => {
    const dirty = reducer(initialState, goToStep('result'));
    expect(reducer(dirty, resetCheckout()).step).toBe('catalog');
  });

  it('clearError clears the error', () => {
    const withError = { ...initialState, error: 'x' };
    expect(reducer(withError, clearError()).error).toBeNull();
  });
});

describe('checkoutSlice extraReducers', () => {
  it('createTransaction.pending sets submitting', () => {
    const state = reducer(initialState, {
      type: createTransaction.pending.type,
    });
    expect(state.submitting).toBe(true);
  });

  it('createTransaction.fulfilled stores tx and goes to summary', () => {
    const state = reducer(initialState, {
      type: createTransaction.fulfilled.type,
      payload: tx,
    });
    expect(state.step).toBe('summary');
    expect(state.transaction?.id).toBe('t1');
  });

  it('createTransaction.rejected sets error', () => {
    const state = reducer(initialState, {
      type: createTransaction.rejected.type,
      payload: 'nope',
    });
    expect(state.error).toBe('nope');
  });

  it('payTransaction.pending goes to processing', () => {
    const state = reducer(initialState, {
      type: payTransaction.pending.type,
    });
    expect(state.step).toBe('processing');
  });

  it('payTransaction.fulfilled goes to result and clears card', () => {
    const withCard = {
      ...initialState,
      card: {
        number: '4242',
        cvc: '123',
        expMonth: '08',
        expYear: '30',
        cardHolder: 'A',
      },
    };
    const state = reducer(withCard, {
      type: payTransaction.fulfilled.type,
      payload: { ...tx, status: 'APPROVED' },
    });
    expect(state.step).toBe('result');
    expect(state.transaction?.status).toBe('APPROVED');
    expect(state.card.number).toBe('');
  });

  it('payTransaction.rejected goes to result with error', () => {
    const state = reducer(initialState, {
      type: payTransaction.rejected.type,
      payload: 'fail',
    });
    expect(state.step).toBe('result');
    expect(state.error).toBe('fail');
  });
});
