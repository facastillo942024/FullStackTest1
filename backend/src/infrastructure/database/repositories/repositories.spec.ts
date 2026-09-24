import { Repository } from 'typeorm';
import { TypeormProductRepository } from './typeorm-product.repository';
import { TypeormCustomerRepository } from './typeorm-customer.repository';
import { TypeormDeliveryRepository } from './typeorm-delivery.repository';
import { TypeormTransactionRepository } from './typeorm-transaction.repository';
import { ProductOrmEntity } from '../entities/product.orm-entity';
import { CustomerOrmEntity } from '../entities/customer.orm-entity';
import { DeliveryOrmEntity } from '../entities/delivery.orm-entity';
import { TransactionOrmEntity } from '../entities/transaction.orm-entity';
import { Product } from '../../../domain/entities/product';
import { Customer } from '../../../domain/entities/customer';
import { Delivery } from '../../../domain/entities/delivery';
import { Transaction } from '../../../domain/entities/transaction';

const productOrm: ProductOrmEntity = {
  id: 'p1',
  name: 'n',
  description: 'd',
  priceInCents: 100,
  stock: 5,
  imageUrl: 'u',
  createdAt: new Date(),
};

describe('TypeORM repositories', () => {
  describe('TypeormProductRepository', () => {
    it('findAll returns mapped products', async () => {
      const repo = {
        find: jest.fn().mockResolvedValue([productOrm]),
      } as unknown as Repository<ProductOrmEntity>;
      const adapter = new TypeormProductRepository(repo);
      const result = await adapter.findAll();
      expect(result.isOk).toBe(true);
      if (result.isOk) expect(result.value[0]).toBeInstanceOf(Product);
    });

    it('findAll maps thrown errors to PersistenceError', async () => {
      const repo = {
        find: jest.fn().mockRejectedValue(new Error('db down')),
      } as unknown as Repository<ProductOrmEntity>;
      const adapter = new TypeormProductRepository(repo);
      const result = await adapter.findAll();
      expect(result.isErr).toBe(true);
    });

    it('findById returns null when not found', async () => {
      const repo = {
        findOne: jest.fn().mockResolvedValue(null),
      } as unknown as Repository<ProductOrmEntity>;
      const adapter = new TypeormProductRepository(repo);
      const result = await adapter.findById('x');
      expect(result.isOk).toBe(true);
      if (result.isOk) expect(result.value).toBeNull();
    });

    it('save returns the mapped product', async () => {
      const repo = {
        save: jest.fn().mockResolvedValue(productOrm),
      } as unknown as Repository<ProductOrmEntity>;
      const adapter = new TypeormProductRepository(repo);
      const result = await adapter.save(
        new Product({
          id: 'p1',
          name: 'n',
          description: 'd',
          priceInCents: 100,
          stock: 5,
          imageUrl: 'u',
        }),
      );
      expect(result.isOk).toBe(true);
    });

    it('maps a non-Error rejection to PersistenceError (String branch)', async () => {
      const repo = {
        findOne: jest.fn().mockRejectedValue('plain string failure'),
      } as unknown as Repository<ProductOrmEntity>;
      const adapter = new TypeormProductRepository(repo);
      const result = await adapter.findById('x');
      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.error.message).toContain('plain string failure');
      }
    });
  });

  describe('TypeormCustomerRepository', () => {
    it('saves and finds a customer', async () => {
      const ormCustomer: CustomerOrmEntity = {
        id: 'c1',
        fullName: 'Juan',
        email: 'j@e.com',
        phoneNumber: '300',
        createdAt: new Date(),
      };
      const repo = {
        save: jest.fn().mockResolvedValue(ormCustomer),
        findOne: jest.fn().mockResolvedValue(ormCustomer),
      } as unknown as Repository<CustomerOrmEntity>;
      const adapter = new TypeormCustomerRepository(repo);
      const saved = await adapter.save(
        new Customer({
          id: 'c1',
          fullName: 'Juan',
          email: 'j@e.com',
          phoneNumber: '300',
        }),
      );
      const found = await adapter.findById('c1');
      expect(saved.isOk).toBe(true);
      expect(found.isOk).toBe(true);
    });

    it('maps a save error', async () => {
      const repo = {
        save: jest.fn().mockRejectedValue('weird'),
        findOne: jest.fn(),
      } as unknown as Repository<CustomerOrmEntity>;
      const adapter = new TypeormCustomerRepository(repo);
      const result = await adapter.save(
        new Customer({
          id: 'c1',
          fullName: 'Juan',
          email: 'j@e.com',
          phoneNumber: '300',
        }),
      );
      expect(result.isErr).toBe(true);
    });
  });

  describe('TypeormDeliveryRepository', () => {
    it('saves and finds a delivery', async () => {
      const ormDelivery: DeliveryOrmEntity = {
        id: 'd1',
        customerId: 'c1',
        addressLine: 'calle',
        city: 'Bogota',
        region: 'Cundinamarca',
        postalCode: '110111',
        createdAt: new Date(),
      };
      const repo = {
        save: jest.fn().mockResolvedValue(ormDelivery),
        findOne: jest.fn().mockResolvedValue(ormDelivery),
      } as unknown as Repository<DeliveryOrmEntity>;
      const adapter = new TypeormDeliveryRepository(repo);
      const saved = await adapter.save(
        new Delivery({
          id: 'd1',
          customerId: 'c1',
          addressLine: 'calle',
          city: 'Bogota',
          region: 'Cundinamarca',
          postalCode: '110111',
        }),
      );
      const found = await adapter.findById('d1');
      expect(saved.isOk).toBe(true);
      expect(found.isOk).toBe(true);
    });

    it('maps a save Error to PersistenceError (Error branch)', async () => {
      const repo = {
        save: jest.fn().mockRejectedValue(new Error('delivery db error')),
        findOne: jest.fn(),
      } as unknown as Repository<DeliveryOrmEntity>;
      const adapter = new TypeormDeliveryRepository(repo);
      const result = await adapter.save(
        new Delivery({
          id: 'd1',
          customerId: 'c1',
          addressLine: 'calle',
          city: 'Bogota',
          region: 'Cundinamarca',
          postalCode: '110111',
        }),
      );
      expect(result.isErr).toBe(true);
    });
  });

  describe('TypeormTransactionRepository', () => {
    const ormTx: TransactionOrmEntity = {
      id: 't1',
      gatewayTransactionId: null,
      customerId: 'c1',
      productId: 'p1',
      deliveryId: 'd1',
      quantity: 1,
      amountInCents: 100,
      baseFeeInCents: 10,
      deliveryFeeInCents: 20,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('saves and finds a transaction', async () => {
      const repo = {
        save: jest.fn().mockResolvedValue(ormTx),
        findOne: jest.fn().mockResolvedValue(ormTx),
      } as unknown as Repository<TransactionOrmEntity>;
      const adapter = new TypeormTransactionRepository(repo);
      const saved = await adapter.save(
        new Transaction({
          id: 't1',
          customerId: 'c1',
          productId: 'p1',
          deliveryId: 'd1',
          quantity: 1,
          amountInCents: 100,
          baseFeeInCents: 10,
          deliveryFeeInCents: 20,
          status: 'PENDING',
        }),
      );
      const found = await adapter.findById('t1');
      expect(saved.isOk).toBe(true);
      expect(found.isOk).toBe(true);
    });

    it('maps a findById error', async () => {
      const repo = {
        save: jest.fn(),
        findOne: jest.fn().mockRejectedValue(new Error('boom')),
      } as unknown as Repository<TransactionOrmEntity>;
      const adapter = new TypeormTransactionRepository(repo);
      const result = await adapter.findById('t1');
      expect(result.isErr).toBe(true);
    });

    it('maps a non-Error save rejection (String branch)', async () => {
      const repo = {
        save: jest.fn().mockRejectedValue(42),
        findOne: jest.fn(),
      } as unknown as Repository<TransactionOrmEntity>;
      const adapter = new TypeormTransactionRepository(repo);
      const result = await adapter.save(
        new Transaction({
          id: 't1',
          customerId: 'c1',
          productId: 'p1',
          deliveryId: 'd1',
          quantity: 1,
          amountInCents: 100,
          baseFeeInCents: 10,
          deliveryFeeInCents: 20,
          status: 'PENDING',
        }),
      );
      expect(result.isErr).toBe(true);
    });
  });
});
