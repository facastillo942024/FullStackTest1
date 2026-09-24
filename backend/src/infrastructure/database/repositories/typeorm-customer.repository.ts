import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result, fromPromise } from '../../../domain/result/result';
import { Customer } from '../../../domain/entities/customer';
import { PersistenceError } from '../../../domain/errors/domain-error';
import { CustomerRepository } from '../../../domain/ports/customer.repository';
import { CustomerOrmEntity } from '../entities/customer.orm-entity';
import { CustomerMapper } from '../mappers/customer.mapper';

const toPersistenceError = (reason: unknown): PersistenceError =>
  new PersistenceError(
    reason instanceof Error ? reason.message : String(reason),
  );

@Injectable()
export class TypeormCustomerRepository implements CustomerRepository {
  constructor(
    @InjectRepository(CustomerOrmEntity)
    private readonly repo: Repository<CustomerOrmEntity>,
  ) {}

  async save(customer: Customer): Promise<Result<Customer, PersistenceError>> {
    const result = await fromPromise(
      this.repo.save(CustomerMapper.toOrm(customer)),
      toPersistenceError,
    );
    return result.map(CustomerMapper.toDomain);
  }

  async findById(
    id: string,
  ): Promise<Result<Customer | null, PersistenceError>> {
    const result = await fromPromise(
      this.repo.findOne({ where: { id } }),
      toPersistenceError,
    );
    return result.map((row) => (row ? CustomerMapper.toDomain(row) : null));
  }
}
