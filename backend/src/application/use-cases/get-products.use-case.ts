import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../domain/result/result';
import { Product } from '../../domain/entities/product';
import { PersistenceError } from '../../domain/errors/domain-error';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../domain/ports/product.repository';

@Injectable()
export class GetProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  execute(): Promise<Result<Product[], PersistenceError>> {
    return this.productRepository.findAll();
  }
}
