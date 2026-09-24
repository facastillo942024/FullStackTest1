import { GetProductByIdUseCase } from './get-product-by-id.use-case';
import { ProductRepository } from '../../domain/ports/product.repository';
import { Product } from '../../domain/entities/product';
import { ok, err } from '../../domain/result/result';
import { PersistenceError } from '../../domain/errors/domain-error';

const product = new Product({
  id: 'p1',
  name: 'n',
  description: 'd',
  priceInCents: 100,
  stock: 5,
  imageUrl: 'u',
});

const makeRepo = (
  overrides: Partial<ProductRepository>,
): ProductRepository => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  ...overrides,
});

describe('GetProductByIdUseCase', () => {
  it('returns the product when found', async () => {
    const repo = makeRepo({
      findById: jest.fn().mockResolvedValue(ok(product)),
    });
    const result = await new GetProductByIdUseCase(repo).execute('p1');
    expect(result.isOk).toBe(true);
  });

  it('returns ProductNotFound when null', async () => {
    const repo = makeRepo({
      findById: jest.fn().mockResolvedValue(ok(null)),
    });
    const result = await new GetProductByIdUseCase(repo).execute('missing');
    expect(result.isErr).toBe(true);
    if (result.isErr) {
      expect(result.error.code).toBe('PRODUCT_NOT_FOUND');
    }
  });

  it('propagates persistence errors', async () => {
    const repo = makeRepo({
      findById: jest.fn().mockResolvedValue(err(new PersistenceError('x'))),
    });
    const result = await new GetProductByIdUseCase(repo).execute('p1');
    expect(result.isErr).toBe(true);
  });
});
