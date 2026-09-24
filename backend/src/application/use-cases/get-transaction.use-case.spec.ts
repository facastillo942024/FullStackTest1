import { GetTransactionUseCase } from './get-transaction.use-case';
import { TransactionRepository } from '../../domain/ports/transaction.repository';
import { Transaction } from '../../domain/entities/transaction';
import { ok, err } from '../../domain/result/result';
import { PersistenceError } from '../../domain/errors/domain-error';

const tx = new Transaction({
  id: 't1',
  customerId: 'c1',
  productId: 'p1',
  deliveryId: 'd1',
  quantity: 1,
  amountInCents: 100,
  baseFeeInCents: 10,
  deliveryFeeInCents: 20,
  status: 'PENDING',
});

const makeRepo = (
  overrides: Partial<TransactionRepository>,
): TransactionRepository => ({
  save: jest.fn(),
  findById: jest.fn(),
  ...overrides,
});

describe('GetTransactionUseCase', () => {
  it('returns the transaction when found', async () => {
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(ok(tx)) });
    const result = await new GetTransactionUseCase(repo).execute('t1');
    expect(result.isOk).toBe(true);
  });

  it('returns TransactionNotFound when null', async () => {
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(ok(null)) });
    const result = await new GetTransactionUseCase(repo).execute('missing');
    expect(result.isErr).toBe(true);
    if (result.isErr) {
      expect(result.error.code).toBe('TRANSACTION_NOT_FOUND');
    }
  });

  it('propagates persistence errors', async () => {
    const repo = makeRepo({
      findById: jest.fn().mockResolvedValue(err(new PersistenceError('x'))),
    });
    const result = await new GetTransactionUseCase(repo).execute('t1');
    expect(result.isErr).toBe(true);
  });
});
