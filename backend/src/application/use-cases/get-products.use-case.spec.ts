import { GetProductsUseCase } from './get-products.use-case';
import { ProductRepository } from '../../domain/ports/product.repository';
import { Product } from '../../domain/entities/product';
import { ok, err } from '../../domain/result/result';
import { PersistenceError } from '../../domain/errors/domain-error';

describe('GetProductsUseCase', () => {
  const product = new Product({
    id: 'p1',
    name: 'n',
    description: 'd',
    priceInCents: 100,
    stock: 5,
    imageUrl: 'u',
  });

  it('returns products from the repository', async () => {
    const repo: ProductRepository = {
      findAll: jest.fn().mockResolvedValue(ok([product])),
      findById: jest.fn(),
      save: jest.fn(),
    };
    const useCase = new GetProductsUseCase(repo);
    const result = await useCase.execute();
    expect(result.isOk).toBe(true);
    if (result.isOk) {
      expect(result.value).toHaveLength(1);
    }
  });

  it('propagates a repository error', async () => {
    const repo: ProductRepository = {
      findAll: jest.fn().mockResolvedValue(err(new PersistenceError('x'))),
      findById: jest.fn(),
      save: jest.fn(),
    };
    const useCase = new GetProductsUseCase(repo);
    const result = await useCase.execute();
    expect(result.isErr).toBe(true);
  });
});
