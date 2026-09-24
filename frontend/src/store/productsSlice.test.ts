import reducer, {
  selectProduct,
  upsertProduct,
  fetchProducts,
} from './productsSlice';
import type { ProductsState } from './productsSlice';
import type { Product } from '../api/types';

const product: Product = {
  id: 'p1',
  name: 'Test',
  description: 'desc',
  priceInCents: 1000,
  stock: 5,
  imageUrl: 'http://img',
};

const initial: ProductsState = {
  items: [],
  selectedId: null,
  loading: false,
  error: null,
};

describe('productsSlice', () => {
  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial);
  });

  it('selectProduct sets the id', () => {
    const state = reducer(initial, selectProduct('p1'));
    expect(state.selectedId).toBe('p1');
  });

  it('upsertProduct adds a new product', () => {
    const state = reducer(initial, upsertProduct(product));
    expect(state.items).toHaveLength(1);
  });

  it('upsertProduct updates an existing product', () => {
    const withItem = { ...initial, items: [product] };
    const state = reducer(
      withItem,
      upsertProduct({ ...product, stock: 3 }),
    );
    expect(state.items[0].stock).toBe(3);
    expect(state.items).toHaveLength(1);
  });

  it('handles fetchProducts.pending', () => {
    const state = reducer(initial, { type: fetchProducts.pending.type });
    expect(state.loading).toBe(true);
  });

  it('handles fetchProducts.fulfilled', () => {
    const state = reducer(initial, {
      type: fetchProducts.fulfilled.type,
      payload: [product],
    });
    expect(state.loading).toBe(false);
    expect(state.items).toHaveLength(1);
  });

  it('handles fetchProducts.rejected', () => {
    const state = reducer(initial, {
      type: fetchProducts.rejected.type,
      payload: 'boom',
    });
    expect(state.error).toBe('boom');
  });
});
