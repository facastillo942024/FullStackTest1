import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result, fromPromise } from '../../../domain/result/result';
import { Transaction } from '../../../domain/entities/transaction';
import { PersistenceError } from '../../../domain/errors/domain-error';
import { TransactionRepository } from '../../../domain/ports/transaction.repository';
import { TransactionOrmEntity } from '../entities/transaction.orm-entity';
import { TransactionMapper } from '../mappers/transaction.mapper';

const toPersistenceError = (reason: unknown): PersistenceError =>
  new PersistenceError(
    reason instanceof Error ? reason.message : String(reason),
  );

@Injectable()
export class TypeormTransactionRepository implements TransactionRepository {
  constructor(
    @InjectRepository(TransactionOrmEntity)
    private readonly repo: Repository<TransactionOrmEntity>,
  ) {}

  async save(
    transaction: Transaction,
  ): Promise<Result<Transaction, PersistenceError>> {
    const result = await fromPromise(
      this.repo.save(TransactionMapper.toOrm(transaction)),
      toPersistenceError,
    );
    return result.map(TransactionMapper.toDomain);
  }

  async findById(
    id: string,
  ): Promise<Result<Transaction | null, PersistenceError>> {
    const result = await fromPromise(
      this.repo.findOne({ where: { id } }),
      toPersistenceError,
    );
    return result.map((row) => (row ? TransactionMapper.toDomain(row) : null));
  }
}
