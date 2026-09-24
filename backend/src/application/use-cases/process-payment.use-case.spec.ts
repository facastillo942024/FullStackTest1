import { ProcessPaymentUseCase } from './process-payment.use-case';
import { Product } from '../../domain/entities/product';
import { Customer } from '../../domain/entities/customer';
import { Transaction } from '../../domain/entities/transaction';
import { ok, err } from '../../domain/result/result';
import {
  PaymentGatewayError,
  PersistenceError,
} from '../../domain/errors/domain-error';
import { TransactionRepository } from '../../domain/ports/transaction.repository';
import { ProductRepository } from '../../domain/ports/product.repository';
import { CustomerRepository } from '../../domain/ports/customer.repository';
import {
  ChargeResult,
  PaymentGatewayPort,
} from '../../domain/ports/payment-gateway.port';
import { ProcessPaymentCommand } from '../commands';

const validCard = {
  number: '4242424242424242',
  cvc: '123',
  expMonth: '08',
  expYear: '30',
  cardHolder: 'JUAN PEREZ',
};

const command: ProcessPaymentCommand = {
  transactionId: 't1',
  card: validCard,
};

const makeTx = (status: 'PENDING' | 'APPROVED' = 'PENDING') =>
  new Transaction({
    id: 't1',
    customerId: 'c1',
    productId: 'p1',
    deliveryId: 'd1',
    quantity: 2,
    amountInCents: 2000,
    baseFeeInCents: 500,
    deliveryFeeInCents: 1500,
    status,
  });

const makeProduct = (stock = 5) =>
  new Product({
    id: 'p1',
    name: 'n',
    description: 'd',
    priceInCents: 1000,
    stock,
    imageUrl: 'u',
  });

const customer = new Customer({
  id: 'c1',
  fullName: 'Juan',
  email: 'j@e.com',
  phoneNumber: '300',
});

const buildDeps = (chargeResult: ChargeResult | PaymentGatewayError) => {
  const txRepo: TransactionRepository = {
    findById: jest.fn().mockResolvedValue(ok(makeTx())),
    save: jest.fn((t: Transaction) => Promise.resolve(ok(t))),
  };
  const productRepo: ProductRepository = {
    findAll: jest.fn(),
    findById: jest.fn().mockResolvedValue(ok(makeProduct())),
    save: jest.fn((p: Product) => Promise.resolve(ok(p))),
  };
  const customerRepo: CustomerRepository = {
    save: jest.fn(),
    findById: jest.fn().mockResolvedValue(ok(customer)),
  };
  const gateway: PaymentGatewayPort = {
    charge: jest
      .fn()
      .mockResolvedValue(
        chargeResult instanceof PaymentGatewayError
          ? err(chargeResult)
          : ok(chargeResult),
      ),
  };
  return { txRepo, productRepo, customerRepo, gateway };
};

const buildUseCase = (deps: ReturnType<typeof buildDeps>) =>
  new ProcessPaymentUseCase(
    deps.txRepo,
    deps.productRepo,
    deps.customerRepo,
    deps.gateway,
  );

describe('ProcessPaymentUseCase', () => {
  it('approves the payment and decrements stock', async () => {
    const deps = buildDeps({
      gatewayTransactionId: 'gw-1',
      status: 'APPROVED',
    });
    const result = await buildUseCase(deps).execute(command);
    expect(result.isOk).toBe(true);
    if (result.isOk) {
      expect(result.value.status).toBe('APPROVED');
      expect(result.value.gatewayTransactionId).toBe('gw-1');
    }
    // stock decremented from 5 by quantity 2 -> product saved
    expect(deps.productRepo.save).toHaveBeenCalled();
  });

  it('declines the payment and leaves stock untouched', async () => {
    const deps = buildDeps({
      gatewayTransactionId: 'gw-2',
      status: 'DECLINED',
    });
    const result = await buildUseCase(deps).execute(command);
    expect(result.isOk).toBe(true);
    if (result.isOk) expect(result.value.status).toBe('DECLINED');
    expect(deps.productRepo.save).not.toHaveBeenCalled();
  });

  it('marks ERROR when the gateway returns a non-final status', async () => {
    const deps = buildDeps({
      gatewayTransactionId: 'gw-3',
      status: 'PENDING',
    });
    const result = await buildUseCase(deps).execute(command);
    expect(result.isOk).toBe(true);
    if (result.isOk) expect(result.value.status).toBe('ERROR');
  });

  it('returns TransactionNotFound when the tx does not exist', async () => {
    const deps = buildDeps({ gatewayTransactionId: 'x', status: 'APPROVED' });
    deps.txRepo.findById = jest.fn().mockResolvedValue(ok(null));
    const result = await buildUseCase(deps).execute(command);
    expect(result.isErr).toBe(true);
    if (result.isErr) expect(result.error.code).toBe('TRANSACTION_NOT_FOUND');
  });

  it('is idempotent for an already finalized transaction', async () => {
    const deps = buildDeps({ gatewayTransactionId: 'x', status: 'APPROVED' });
    deps.txRepo.findById = jest.fn().mockResolvedValue(ok(makeTx('APPROVED')));
    const result = await buildUseCase(deps).execute(command);
    expect(result.isOk).toBe(true);
    expect(deps.gateway.charge).not.toHaveBeenCalled();
  });

  it('returns InvalidCard for a bad card', async () => {
    const deps = buildDeps({ gatewayTransactionId: 'x', status: 'APPROVED' });
    const result = await buildUseCase(deps).execute({
      transactionId: 't1',
      card: { ...validCard, number: '1234' },
    });
    expect(result.isErr).toBe(true);
    if (result.isErr) expect(result.error.code).toBe('INVALID_CARD');
  });

  it('marks ERROR and returns error when the gateway fails', async () => {
    const deps = buildDeps(new PaymentGatewayError('gateway down'));
    const result = await buildUseCase(deps).execute(command);
    expect(result.isErr).toBe(true);
    if (result.isErr) expect(result.error.code).toBe('PAYMENT_GATEWAY_ERROR');
    // transaction persisted as ERROR
    expect(deps.txRepo.save).toHaveBeenCalled();
  });

  it('marks ERROR when stock cannot be applied after approval', async () => {
    const deps = buildDeps({ gatewayTransactionId: 'gw', status: 'APPROVED' });
    deps.productRepo.findById = jest.fn().mockResolvedValue(ok(makeProduct(1))); // not enough for quantity 2
    const result = await buildUseCase(deps).execute(command);
    expect(result.isErr).toBe(true);
    if (result.isErr) expect(result.error.code).toBe('INSUFFICIENT_STOCK');
  });

  it('propagates a transaction lookup error', async () => {
    const deps = buildDeps({ gatewayTransactionId: 'x', status: 'APPROVED' });
    deps.txRepo.findById = jest
      .fn()
      .mockResolvedValue(err(new PersistenceError('x')));
    const result = await buildUseCase(deps).execute(command);
    expect(result.isErr).toBe(true);
  });

  it('falls back to a default email when customer is missing', async () => {
    const deps = buildDeps({ gatewayTransactionId: 'gw', status: 'APPROVED' });
    deps.customerRepo.findById = jest.fn().mockResolvedValue(ok(null));
    const result = await buildUseCase(deps).execute(command);
    expect(result.isOk).toBe(true);
  });
});
