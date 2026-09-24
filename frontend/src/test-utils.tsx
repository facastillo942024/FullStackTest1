import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import productsReducer from './store/productsSlice';
import checkoutReducer from './store/checkoutSlice';
import type { RootState } from './store';

export const makeStore = (preloaded?: Partial<RootState>) =>
  configureStore({
    reducer: {
      products: productsReducer,
      checkout: checkoutReducer,
    },
    preloadedState: preloaded as RootState | undefined,
  });

export type TestStore = ReturnType<typeof makeStore>;

export function renderWithStore(
  ui: ReactElement,
  store: TestStore = makeStore(),
) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return { store, ...render(ui, { wrapper: Wrapper }) };
}
