import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionStatus } from '../../../domain/entities/transaction';

@Entity({ name: 'transactions' })
export class TransactionOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({
    name: 'wompi_transaction_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  gatewayTransactionId!: string | null;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ name: 'delivery_id', type: 'uuid' })
  deliveryId!: string;

  @Column({ type: 'integer', default: 1 })
  quantity!: number;

  @Column({ name: 'amount_in_cents', type: 'integer' })
  amountInCents!: number;

  @Column({ name: 'base_fee_in_cents', type: 'integer' })
  baseFeeInCents!: number;

  @Column({ name: 'delivery_fee_in_cents', type: 'integer' })
  deliveryFeeInCents!: number;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'APPROVED', 'DECLINED', 'ERROR'],
    default: 'PENDING',
  })
  status!: TransactionStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
