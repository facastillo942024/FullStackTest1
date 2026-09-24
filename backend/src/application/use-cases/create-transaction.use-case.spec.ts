import { CreateTransactionUseCase } from './create-transaction.use-case';
import { Product } from '../../domain/entities/product';
import { Customer } from '../../domain/entities/customer';
import { Delivery } from '../../domain/entities/delivery';
import { Transaction } from '../../domain/entities/transaction';
import { ok, err } from '../../domain/result/result';
import { PersistenceError } from '../../domain/errors/domain-error';
import { ProductRepository } from '../../domain/ports/product.repository';
import { CustomerRepository } from '../../domain/ports/customer.repository';
import { DeliveryRepository } from '../../domain/ports/delivery.repository';
import { TransactionRepository } from '../../domain/ports/transaction.repository';
import { IdGeneratorPort } from '../../domain/ports/id-generator.port';
import { FeesProviderPort } from '../../domain/ports/fees.port';
import { CreateTransactionCommand } from '../commands';

const product = new Product({
  id: 'p1',
  name: 'n',
  description: 'd',
  priceInCents: 1000,
  stock: 5,
  imageUrl: 'u',
});

const command: CreateTransactionCommand = {
  productId: 'p1',
  quantity: 2,
  customer: { fullName: 'Juan', email: 'j@e.com', phoneNumber: '300' },
  delivery: {
    addressLine: 'calle 1',
    city: 'Bogota',
    region: 'Cundinamarca',
    postalCode: '110111',
  },
};

const buildDeps = () => {
  const productRepo: ProductRepository = {
    findAll: jest.fn(),
    findById: jest.fn().mockResolvedValue(ok(product)),
    save: jest.fn(),
  };
  const customerRepo: CustomerRepository = {
    save: jest.fn((c: Customer) => Promise.resolve(ok(c))),
    findById: jest.fn(),
  };
  const deliveryRepo: DeliveryRepository = {
    save: jest.fn((d: Delivery) => Promise.resolve(ok(d))),
    findById: jest.fn(),
  };
  const txRepo: TransactionRepository = {
    save: jest.fn((t: Transaction) => Promise.resolve(ok(t))),
    findById: jest.fn(),
  };
  const idGen: IdGeneratorPort = { generate: jest.fn(() => 'generated-id') };
  const fees: FeesProviderPort = {
    getBaseFeeInCents: jest.fn(() => 500),
    getDeliveryFeeInCents: jest.fn(() => 1500),
  };
  return { productRepo, customerRepo, deliveryRepo, txRepo, idGen, fees };
};

const buildUseCase = (deps: ReturnType<typeof buildDeps>) =>
  new CreateTransactionUseCase(
    deps.productRepo,
    deps.customerRepo,
    deps.deliveryRepo,
    deps.txRepo,
    deps.idGen,
    deps.fees,
  );

describe('CreateTransactionUseCase', () => {
  it('creates a PENDING transaction with computed amount and fees', async () => {
    const deps = buildDeps();
    const result = await buildUseCase(deps).execute(command);
    expect(result.isOk).toBe(true);
    if (result.isOk) {
      expect(result.value.status).toBe('PENDING');
      expect(result.value.amountInCents).toBe(2000); // 1000 * 2
      expect(result.value.baseFeeInCents).toBe(500);
      expect(result.value.deliveryFeeInCents).toBe(1500);
      expect(result.value.totalInCents).toBe(4000);
    }
    expect(deps.customerRepo.save).toHaveBeenCalled();
    expect(deps.deliveryRepo.save).toHaveBeenCalled();
    expect(deps.txRepo.save).toHaveBeenCalled();
  });

  it('rejects non-positive quantity', async () => {
    const deps = buildDeps();
    const result = await buildUseCase(deps).execute({
      ...command,
      quantity: 0,
    });
    expect(result.isErr).toBe(true);
    if (result.isErr) expect(result.error.code).toBe('VALIDATION_ERROR');
  });

  it('fails when the product does not exist', async () => {
    const deps = buildDeps();
    deps.productRepo.findById = jest.fn().mockResolvedValue(ok(null));
    const result = await buildUseCase(deps).execute(command);
    expect(result.isErr).toBe(true);
    if (result.isErr) expect(result.error.code).toBe('PRODUCT_NOT_FOUND');
  });

  it('fails when there is not enough stock', async () => {
    const deps = buildDeps();
    deps.productRepo.findById = jest.fn().mockResolvedValue(
      ok(
        new Product({
          id: 'p1',
          name: 'n',
          description: 'd',
          priceInCents: 1000,
          stock: 1,
          imageUrl: 'u',
        }),
      ),
    );
    const result = await buildUseCase(deps).execute(command);
    expect(result.isErr).toBe(true);
    if (result.isErr) expect(result.error.code).toBe('INSUFFICIENT_STOCK');
  });

  it('propagates a product lookup error', async () => {
    const deps = buildDeps();
    deps.productRepo.findById = jest
      .fn()
      .mockResolvedValue(err(new PersistenceError('x')));
    const result = await buildUseCase(deps).execute(command);
    expect(result.isErr).toBe(true);
  });

  it('propagates a customer save error', async () => {
    const deps = buildDeps();
    deps.customerRepo.save = jest
      .fn()
      .mockResolvedValue(err(new PersistenceError('x')));
    const result = await buildUseCase(deps).execute(command);
    expect(result.isErr).toBe(true);
  });

  it('propagates a delivery save error', async () => {
    const deps = buildDeps();
    deps.deliveryRepo.save = jest
      .fn()
      .mockResolvedValue(err(new PersistenceError('x')));
    const result = await buildUseCase(deps).execute(command);
    expect(result.isErr).toBe(true);
  });

  it('propagates a transaction save error', async () => {
    const deps = buildDeps();
    deps.txRepo.save = jest
      .fn()
      .mockResolvedValue(err(new PersistenceError('x')));
    const result = await buildUseCase(deps).execute(command);
    expect(result.isErr).toBe(true);
  });
});
