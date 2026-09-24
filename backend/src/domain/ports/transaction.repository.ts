import { Result } from '../result/result';
import { Transaction } from '../entities/transaction';
import { PersistenceError } from '../errors/domain-error';

export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');

export interface TransactionRepository {
  save(
    transaction: Transaction,
  ): Promise<Result<Transaction, PersistenceError>>;
  findById(id: string): Promise<Result<Transaction | null, PersistenceError>>;
}
