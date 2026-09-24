import { Product } from './product';

const makeProduct = (stock: number): Product =>
  new Product({
    id: 'p1',
    name: 'Test',
    description: 'desc',
    priceInCents: 1000,
    stock,
    imageUrl: 'http://img',
  });

describe('Product entity', () => {
  it('reports whether it has enough stock', () => {
    const product = makeProduct(5);
    expect(product.hasStock(5)).toBe(true);
    expect(product.hasStock(6)).toBe(false);
  });

  it('decrements stock on success', () => {
    const product = makeProduct(5);
    const result = product.decrementStock(2);
    expect(result.isOk).toBe(true);
    expect(product.stock).toBe(3);
  });

  it('treats non-positive quantity as a no-op', () => {
    const product = makeProduct(5);
    const result = product.decrementStock(0);
    expect(result.isOk).toBe(true);
    expect(product.stock).toBe(5);
  });

  it('fails when there is not enough stock', () => {
    const product = makeProduct(1);
    const result = product.decrementStock(2);
    expect(result.isErr).toBe(true);
    expect(product.stock).toBe(1);
  });

  it('defaults createdAt when not provided', () => {
    const product = makeProduct(1);
    expect(product.createdAt).toBeInstanceOf(Date);
  });
});
