import { Result } from '../result/result';
import { Product } from '../entities/product';
import { PersistenceError } from '../errors/domain-error';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface ProductRepository {
  findAll(): Promise<Result<Product[], PersistenceError>>;
  findById(id: string): Promise<Result<Product | null, PersistenceError>>;
  save(product: Product): Promise<Result<Product, PersistenceError>>;
}
