import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './productsSlice';
import checkoutReducer, {
  initialState as checkoutInitialState,
} from './checkoutSlice';
import {
  loadCheckoutState,
  saveCheckoutState,
  clearCheckoutState,
} from './persistence';

const persisted = loadCheckoutState();

export const store = configureStore({
  reducer: {
    products: productsReducer,
    checkout: checkoutReducer,
  },
  preloadedState: persisted
    ? {
        checkout: {
          ...checkoutInitialState,
          ...persisted,
          // Runtime-only fields always start clean.
          card: checkoutInitialState.card,
          submitting: false,
          error: null,
        },
      }
    : undefined,
});

// Persist the checkout slice on every change (card excluded).
store.subscribe(() => {
  const state = store.getState();
  if (state.checkout.step === 'catalog' && !state.checkout.transaction) {
    clearCheckoutState();
  } else {
    saveCheckoutState(state.checkout);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
