/**
 * Exercises the real store singleton: dispatching actions triggers the
 * persistence subscriber (save on progress, clear on reset).
 */
describe('store persistence integration', () => {
  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
  });

  it('persists checkout state when advancing the flow', async () => {
    const { store } = await import('./index');
    const { startCheckout } = await import('./checkoutSlice');
    store.dispatch(startCheckout({ productId: 'p1', quantity: 2 }));
    const raw = localStorage.getItem('checkout_state_v1');
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string).productId).toBe('p1');
  });

  it('clears storage when returning to catalog without a transaction', async () => {
    const { store } = await import('./index');
    const { startCheckout, resetCheckout } = await import('./checkoutSlice');
    store.dispatch(startCheckout({ productId: 'p1', quantity: 1 }));
    store.dispatch(resetCheckout());
    expect(localStorage.getItem('checkout_state_v1')).toBeNull();
  });

  it('hydrates preloaded state from localStorage', async () => {
    localStorage.setItem(
      'checkout_state_v1',
      JSON.stringify({
        step: 'summary',
        productId: 'p9',
        quantity: 3,
        customer: { fullName: '', email: '', phoneNumber: '' },
        delivery: { addressLine: '', city: '', region: '', postalCode: '' },
        transaction: null,
      }),
    );
    const { store } = await import('./index');
    expect(store.getState().checkout.step).toBe('summary');
    expect(store.getState().checkout.productId).toBe('p9');
    // Runtime-only fields reset.
    expect(store.getState().checkout.card.number).toBe('');
  });
});
