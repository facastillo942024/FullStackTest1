import { toProductView } from './product.presenter';
import { toTransactionView } from './transaction.presenter';
import { Product } from '../../../domain/entities/product';
import { Transaction } from '../../../domain/entities/transaction';

describe('Presenters', () => {
  it('toProductView exposes only public fields', () => {
    const view = toProductView(
      new Product({
        id: 'p1',
        name: 'n',
        description: 'd',
        priceInCents: 100,
        stock: 5,
        imageUrl: 'u',
      }),
    );
    expect(view).toEqual({
      id: 'p1',
      name: 'n',
      description: 'd',
      priceInCents: 100,
      stock: 5,
      imageUrl: 'u',
    });
  });

  it('toTransactionView serializes dates and totals', () => {
    const view = toTransactionView(
      new Transaction({
        id: 't1',
        wompiTransactionId: 'gw',
        customerId: 'c1',
        productId: 'p1',
        deliveryId: 'd1',
        quantity: 2,
        amountInCents: 2000,
        baseFeeInCents: 500,
        deliveryFeeInCents: 1500,
        status: 'APPROVED',
      }),
    );
    expect(view.status).toBe('APPROVED');
    expect(view.totalInCents).toBe(4000);
    expect(typeof view.createdAt).toBe('string');
    expect(typeof view.updatedAt).toBe('string');
  });
});
