import type { CheckoutState } from './checkoutSlice';

const STORAGE_KEY = 'checkout_state_v1';

/**
 * Persists the checkout slice to localStorage for resilience against page
 * reloads. Card data is intentionally excluded for security.
 */
export type PersistedCheckout = Omit<
  CheckoutState,
  'card' | 'submitting' | 'error'
>;

export const loadCheckoutState = (): PersistedCheckout | undefined => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw) as PersistedCheckout;
  } catch {
    return undefined;
  }
};

export const saveCheckoutState = (state: CheckoutState): void => {
  try {
    const { card: _card, submitting: _s, error: _e, ...persistable } = state;
    void _card;
    void _s;
    void _e;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
  } catch {
    // Ignore quota / serialization errors — persistence is best-effort.
  }
};

export const clearCheckoutState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
};
