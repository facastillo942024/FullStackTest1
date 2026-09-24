import { Inject, Injectable } from '@nestjs/common';
import { Result, err, ok } from '../../domain/result/result';
import { Transaction } from '../../domain/entities/transaction';
import {
  PersistenceError,
  TransactionNotFoundError,
} from '../../domain/errors/domain-error';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepository,
} from '../../domain/ports/transaction.repository';

type GetTransactionError = PersistenceError | TransactionNotFoundError;

@Injectable()
export class GetTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(id: string): Promise<Result<Transaction, GetTransactionError>> {
    const result = await this.transactionRepository.findById(id);
    if (result.isErr) {
      return err(result.error);
    }
    if (result.value === null) {
      return err(new TransactionNotFoundError(id));
    }
    return ok(result.value);
  }
}
