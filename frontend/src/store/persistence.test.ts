import {
  loadCheckoutState,
  saveCheckoutState,
  clearCheckoutState,
} from './persistence';
import { initialState } from './checkoutSlice';

describe('persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns undefined when nothing is stored', () => {
    expect(loadCheckoutState()).toBeUndefined();
  });

  it('saves and loads state without the card', () => {
    const state = {
      ...initialState,
      step: 'summary' as const,
      productId: 'p1',
      card: {
        number: '4242',
        cvc: '123',
        expMonth: '08',
        expYear: '30',
        cardHolder: 'A',
      },
    };
    saveCheckoutState(state);
    const loaded = loadCheckoutState();
    expect(loaded?.step).toBe('summary');
    expect(loaded?.productId).toBe('p1');
    // Card must never be persisted.
    expect((loaded as Record<string, unknown>).card).toBeUndefined();
  });

  it('clears stored state', () => {
    saveCheckoutState(initialState);
    clearCheckoutState();
    expect(loadCheckoutState()).toBeUndefined();
  });

  it('returns undefined on corrupt JSON', () => {
    localStorage.setItem('checkout_state_v1', '{not json');
    expect(loadCheckoutState()).toBeUndefined();
  });
});
