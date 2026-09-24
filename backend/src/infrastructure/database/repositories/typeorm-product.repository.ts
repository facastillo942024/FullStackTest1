import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result, fromPromise } from '../../../domain/result/result';
import { Product } from '../../../domain/entities/product';
import { PersistenceError } from '../../../domain/errors/domain-error';
import { ProductRepository } from '../../../domain/ports/product.repository';
import { ProductOrmEntity } from '../entities/product.orm-entity';
import { ProductMapper } from '../mappers/product.mapper';

const toPersistenceError = (reason: unknown): PersistenceError =>
  new PersistenceError(
    reason instanceof Error ? reason.message : String(reason),
  );

@Injectable()
export class TypeormProductRepository implements ProductRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly repo: Repository<ProductOrmEntity>,
  ) {}

  async findAll(): Promise<Result<Product[], PersistenceError>> {
    const result = await fromPromise(
      this.repo.find({ order: { createdAt: 'ASC' } }),
      toPersistenceError,
    );
    return result.map((rows) => rows.map(ProductMapper.toDomain));
  }

  async findById(
    id: string,
  ): Promise<Result<Product | null, PersistenceError>> {
    const result = await fromPromise(
      this.repo.findOne({ where: { id } }),
      toPersistenceError,
    );
    return result.map((row) => (row ? ProductMapper.toDomain(row) : null));
  }

  async save(product: Product): Promise<Result<Product, PersistenceError>> {
    const result = await fromPromise(
      this.repo.save(ProductMapper.toOrm(product)),
      toPersistenceError,
    );
    return result.map(ProductMapper.toDomain);
  }
}
