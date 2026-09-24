import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCatalog } from './ProductCatalog';
import { renderWithStore, makeStore } from '../test-utils';
import { checkoutApi } from '../api/checkoutApi';
import type { Product } from '../api/types';

jest.mock('../api/checkoutApi');

const products: Product[] = [
  {
    id: 'p1',
    name: 'Auriculares',
    description: 'desc',
    priceInCents: 100000,
    stock: 5,
    imageUrl: 'http://img',
  },
  {
    id: 'p2',
    name: 'Teclado',
    description: 'desc2',
    priceInCents: 200000,
    stock: 0,
    imageUrl: 'http://img2',
  },
];

const mockedApi = checkoutApi as jest.Mocked<typeof checkoutApi>;

describe('ProductCatalog', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches and renders products', async () => {
    mockedApi.getProducts.mockResolvedValue(products);
    renderWithStore(<ProductCatalog />);
    expect(await screen.findByText('Auriculares')).toBeInTheDocument();
    expect(screen.getByText('Teclado')).toBeInTheDocument();
  });

  it('disables the button for out-of-stock products', async () => {
    mockedApi.getProducts.mockResolvedValue(products);
    renderWithStore(<ProductCatalog />);
    await screen.findByText('Teclado');
    expect(
      screen.getByRole('button', { name: /Sin stock/i }),
    ).toBeDisabled();
  });

  it('starts checkout when clicking pay', async () => {
    mockedApi.getProducts.mockResolvedValue(products);
    const store = makeStore();
    renderWithStore(<ProductCatalog />, store);
    const buyBtn = await screen.findByRole('button', {
      name: /Pagar con tarjeta/i,
    });
    await userEvent.click(buyBtn);
    expect(store.getState().checkout.step).toBe('form');
    expect(store.getState().checkout.productId).toBe('p1');
  });

  it('shows an error state and allows retry', async () => {
    mockedApi.getProducts.mockRejectedValue(new Error('down'));
    renderWithStore(<ProductCatalog />);
    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument(),
    );
    expect(
      screen.getByRole('button', { name: /Reintentar/i }),
    ).toBeInTheDocument();
  });
});
