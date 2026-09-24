import { ProductMapper } from './product.mapper';
import { CustomerMapper } from './customer.mapper';
import { DeliveryMapper } from './delivery.mapper';
import { TransactionMapper } from './transaction.mapper';
import { Product } from '../../../domain/entities/product';
import { Customer } from '../../../domain/entities/customer';
import { Delivery } from '../../../domain/entities/delivery';
import { Transaction } from '../../../domain/entities/transaction';

describe('Mappers round-trip', () => {
  const now = new Date();

  it('Product maps to ORM and back', () => {
    const product = new Product({
      id: 'p1',
      name: 'n',
      description: 'd',
      priceInCents: 100,
      stock: 5,
      imageUrl: 'u',
      createdAt: now,
    });
    const orm = ProductMapper.toOrm(product);
    const back = ProductMapper.toDomain(orm);
    expect(back.id).toBe('p1');
    expect(back.stock).toBe(5);
    expect(back.priceInCents).toBe(100);
  });

  it('Customer maps to ORM and back', () => {
    const customer = new Customer({
      id: 'c1',
      fullName: 'Juan',
      email: 'j@e.com',
      phoneNumber: '300',
      createdAt: now,
    });
    const back = CustomerMapper.toDomain(CustomerMapper.toOrm(customer));
    expect(back.email).toBe('j@e.com');
    expect(back.fullName).toBe('Juan');
  });

  it('Delivery maps to ORM and back', () => {
    const delivery = new Delivery({
      id: 'd1',
      customerId: 'c1',
      addressLine: 'calle 1',
      city: 'Bogota',
      region: 'Cundinamarca',
      postalCode: '110111',
      createdAt: now,
    });
    const back = DeliveryMapper.toDomain(DeliveryMapper.toOrm(delivery));
    expect(back.city).toBe('Bogota');
    expect(back.customerId).toBe('c1');
  });

  it('Transaction maps to ORM and back preserving status and total', () => {
    const tx = new Transaction({
      id: 't1',
      wompiTransactionId: 'gw-1',
      customerId: 'c1',
      productId: 'p1',
      deliveryId: 'd1',
      quantity: 2,
      amountInCents: 2000,
      baseFeeInCents: 500,
      deliveryFeeInCents: 1500,
      status: 'APPROVED',
      createdAt: now,
      updatedAt: now,
    });
    const back = TransactionMapper.toDomain(TransactionMapper.toOrm(tx));
    expect(back.status).toBe('APPROVED');
    expect(back.gatewayTransactionId).toBe('gw-1');
    expect(back.totalInCents).toBe(4000);
    expect(back.quantity).toBe(2);
  });
});
