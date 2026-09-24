import { ProductsController } from './products.controller';
import { GetProductsUseCase } from '../../../application/use-cases/get-products.use-case';
import { GetProductByIdUseCase } from '../../../application/use-cases/get-product-by-id.use-case';
import { Product } from '../../../domain/entities/product';
import { ok, err } from '../../../domain/result/result';
import {
  PersistenceError,
  ProductNotFoundError,
} from '../../../domain/errors/domain-error';
import { DomainHttpException } from '../filters/domain-exception.filter';

const product = new Product({
  id: 'p1',
  name: 'n',
  description: 'd',
  priceInCents: 100,
  stock: 5,
  imageUrl: 'u',
});

describe('ProductsController', () => {
  it('findAll returns product views', async () => {
    const getProducts = {
      execute: jest.fn().mockResolvedValue(ok([product])),
    } as unknown as GetProductsUseCase;
    const controller = new ProductsController(
      getProducts,
      {} as GetProductByIdUseCase,
    );
    const result = await controller.findAll();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p1');
  });

  it('findAll throws DomainHttpException on error', async () => {
    const getProducts = {
      execute: jest.fn().mockResolvedValue(err(new PersistenceError('x'))),
    } as unknown as GetProductsUseCase;
    const controller = new ProductsController(
      getProducts,
      {} as GetProductByIdUseCase,
    );
    await expect(controller.findAll()).rejects.toBeInstanceOf(
      DomainHttpException,
    );
  });

  it('findOne returns a single product view', async () => {
    const getById = {
      execute: jest.fn().mockResolvedValue(ok(product)),
    } as unknown as GetProductByIdUseCase;
    const controller = new ProductsController(
      {} as GetProductsUseCase,
      getById,
    );
    const result = await controller.findOne('p1');
    expect(result.id).toBe('p1');
  });

  it('findOne throws when not found', async () => {
    const getById = {
      execute: jest.fn().mockResolvedValue(err(new ProductNotFoundError('x'))),
    } as unknown as GetProductByIdUseCase;
    const controller = new ProductsController(
      {} as GetProductsUseCase,
      getById,
    );
    await expect(controller.findOne('x')).rejects.toBeInstanceOf(
      DomainHttpException,
    );
  });
});
