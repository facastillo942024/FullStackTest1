import { Transaction } from '../../../domain/entities/transaction';

export interface TransactionView {
  id: string;
  status: string;
  gatewayTransactionId: string | null;
  productId: string;
  customerId: string;
  deliveryId: string;
  quantity: number;
  amountInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  totalInCents: number;
  createdAt: string;
  updatedAt: string;
}

export const toTransactionView = (tx: Transaction): TransactionView => ({
  id: tx.id,
  status: tx.status,
  gatewayTransactionId: tx.gatewayTransactionId,
  productId: tx.productId,
  customerId: tx.customerId,
  deliveryId: tx.deliveryId,
  quantity: tx.quantity,
  amountInCents: tx.amountInCents,
  baseFeeInCents: tx.baseFeeInCents,
  deliveryFeeInCents: tx.deliveryFeeInCents,
  totalInCents: tx.totalInCents,
  createdAt: tx.createdAt.toISOString(),
  updatedAt: tx.updatedAt.toISOString(),
});
