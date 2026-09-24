import { Transaction } from '../../../domain/entities/transaction';
import { TransactionOrmEntity } from '../entities/transaction.orm-entity';

export class TransactionMapper {
  static toDomain(orm: TransactionOrmEntity): Transaction {
    return new Transaction({
      id: orm.id,
      wompiTransactionId: orm.gatewayTransactionId,
      customerId: orm.customerId,
      productId: orm.productId,
      deliveryId: orm.deliveryId,
      quantity: orm.quantity,
      amountInCents: orm.amountInCents,
      baseFeeInCents: orm.baseFeeInCents,
      deliveryFeeInCents: orm.deliveryFeeInCents,
      status: orm.status,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(domain: Transaction): TransactionOrmEntity {
    const orm = new TransactionOrmEntity();
    orm.id = domain.id;
    orm.gatewayTransactionId = domain.gatewayTransactionId;
    orm.customerId = domain.customerId;
    orm.productId = domain.productId;
    orm.deliveryId = domain.deliveryId;
    orm.quantity = domain.quantity;
    orm.amountInCents = domain.amountInCents;
    orm.baseFeeInCents = domain.baseFeeInCents;
    orm.deliveryFeeInCents = domain.deliveryFeeInCents;
    orm.status = domain.status;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
