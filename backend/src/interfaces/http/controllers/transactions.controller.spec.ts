import { TransactionsController } from './transactions.controller';
import { CreateTransactionUseCase } from '../../../application/use-cases/create-transaction.use-case';
import { ProcessPaymentUseCase } from '../../../application/use-cases/process-payment.use-case';
import { GetTransactionUseCase } from '../../../application/use-cases/get-transaction.use-case';
import { Transaction } from '../../../domain/entities/transaction';
import { ok, err } from '../../../domain/result/result';
import {
  InvalidCardError,
  TransactionNotFoundError,
} from '../../../domain/errors/domain-error';
import { DomainHttpException } from '../filters/domain-exception.filter';

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

const createDto = {
  productId: 'p1',
  quantity: 1,
  customer: { fullName: 'Juan', email: 'j@e.com', phoneNumber: '300' },
  delivery: {
    addressLine: 'calle',
    city: 'Bogota',
    region: 'Cundinamarca',
    postalCode: '110111',
  },
};

const payDto = {
  card: {
    number: '4242424242424242',
    cvc: '123',
    expMonth: '08',
    expYear: '30',
    cardHolder: 'JUAN PEREZ',
  },
};

describe('TransactionsController', () => {
  it('create returns a transaction view', async () => {
    const create = {
      execute: jest.fn().mockResolvedValue(ok(tx)),
    } as unknown as CreateTransactionUseCase;
    const controller = new TransactionsController(
      create,
      {} as ProcessPaymentUseCase,
      {} as GetTransactionUseCase,
    );
    const result = await controller.create(createDto);
    expect(result.id).toBe('t1');
    expect(result.status).toBe('PENDING');
  });

  it('create throws on failure', async () => {
    const create = {
      execute: jest
        .fn()
        .mockResolvedValue(err(new TransactionNotFoundError('x'))),
    } as unknown as CreateTransactionUseCase;
    const controller = new TransactionsController(
      create,
      {} as ProcessPaymentUseCase,
      {} as GetTransactionUseCase,
    );
    await expect(controller.create(createDto)).rejects.toBeInstanceOf(
      DomainHttpException,
    );
  });

  it('pay returns the settled transaction', async () => {
    const settled = new Transaction({
      id: 't1',
      customerId: 'c1',
      productId: 'p1',
      deliveryId: 'd1',
      quantity: 1,
      amountInCents: 100,
      baseFeeInCents: 10,
      deliveryFeeInCents: 20,
      status: 'APPROVED',
    });
    const pay = {
      execute: jest.fn().mockResolvedValue(ok(settled)),
    } as unknown as ProcessPaymentUseCase;
    const controller = new TransactionsController(
      {} as CreateTransactionUseCase,
      pay,
      {} as GetTransactionUseCase,
    );
    const result = await controller.pay('t1', payDto);
    expect(result.status).toBe('APPROVED');
  });

  it('pay throws on invalid card', async () => {
    const pay = {
      execute: jest.fn().mockResolvedValue(err(new InvalidCardError('bad'))),
    } as unknown as ProcessPaymentUseCase;
    const controller = new TransactionsController(
      {} as CreateTransactionUseCase,
      pay,
      {} as GetTransactionUseCase,
    );
    await expect(controller.pay('t1', payDto)).rejects.toBeInstanceOf(
      DomainHttpException,
    );
  });

  it('findOne returns a transaction view', async () => {
    const get = {
      execute: jest.fn().mockResolvedValue(ok(tx)),
    } as unknown as GetTransactionUseCase;
    const controller = new TransactionsController(
      {} as CreateTransactionUseCase,
      {} as ProcessPaymentUseCase,
      get,
    );
    const result = await controller.findOne('t1');
    expect(result.id).toBe('t1');
  });

  it('findOne throws when not found', async () => {
    const get = {
      execute: jest
        .fn()
        .mockResolvedValue(err(new TransactionNotFoundError('x'))),
    } as unknown as GetTransactionUseCase;
    const controller = new TransactionsController(
      {} as CreateTransactionUseCase,
      {} as ProcessPaymentUseCase,
      get,
    );
    await expect(controller.findOne('x')).rejects.toBeInstanceOf(
      DomainHttpException,
    );
  });
});
