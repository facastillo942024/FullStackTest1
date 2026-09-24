import { Inject, Injectable } from '@nestjs/common';
import { Result, err, ok } from '../../domain/result/result';
import { Product } from '../../domain/entities/product';
import {
  PersistenceError,
  ProductNotFoundError,
} from '../../domain/errors/domain-error';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../domain/ports/product.repository';

type GetProductByIdError = PersistenceError | ProductNotFoundError;

@Injectable()
export class GetProductByIdUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: string): Promise<Result<Product, GetProductByIdError>> {
    const found = await this.productRepository.findById(id);
    if (found.isErr) {
      return err(found.error);
    }
    if (found.value === null) {
      return err(new ProductNotFoundError(id));
    }
    return ok(found.value);
  }
}
