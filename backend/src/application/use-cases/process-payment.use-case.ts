import { Inject, Injectable } from '@nestjs/common';
import { Result, err, ok } from '../../domain/result/result';
import { Transaction } from '../../domain/entities/transaction';
import { Card } from '../../domain/value-objects/card';
import {
  InsufficientStockError,
  InvalidCardError,
  PaymentGatewayError,
  PersistenceError,
  ProductNotFoundError,
  TransactionNotFoundError,
  ValidationError,
} from '../../domain/errors/domain-error';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepository,
} from '../../domain/ports/transaction.repository';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../domain/ports/product.repository';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepository,
} from '../../domain/ports/customer.repository';
import {
  PAYMENT_GATEWAY,
  PaymentGatewayPort,
} from '../../domain/ports/payment-gateway.port';
import { ProcessPaymentCommand } from '../commands';

export type ProcessPaymentError =
  | TransactionNotFoundError
  | ProductNotFoundError
  | ValidationError
  | InvalidCardError
  | InsufficientStockError
  | PaymentGatewayError
  | PersistenceError;

/**
 * Orchestrates the payment of an existing PENDING transaction.
 *
 * Railway pipeline:
 *   load transaction (must be PENDING)
 *   -> validate card
 *   -> charge via gateway
 *   -> on APPROVED: decrement product stock, mark APPROVED
 *      on DECLINED/ERROR: mark DECLINED/ERROR (stock untouched)
 *   -> persist transaction
 *
 * Any infrastructure failure is mapped onto the error track. If the charge
 * itself throws, the transaction is persisted as ERROR so the state is never
 * left dangling in PENDING.
 */
@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  async execute(
    command: ProcessPaymentCommand,
  ): Promise<Result<Transaction, ProcessPaymentError>> {
    const txResult = await this.transactionRepository.findById(
      command.transactionId,
    );
    if (txResult.isErr) {
      return err(txResult.error);
    }
    const transaction = txResult.value;
    if (transaction === null) {
      return err(new TransactionNotFoundError(command.transactionId));
    }

    if (transaction.isFinalized()) {
      // Idempotency: a finalized transaction is returned as-is.
      return ok(transaction);
    }

    const cardResult = Card.create(command.card);
    if (cardResult.isErr) {
      return err(cardResult.error);
    }
    const card = cardResult.value;

    const customerResult = await this.customerRepository.findById(
      transaction.customerId,
    );
    if (customerResult.isErr) {
      return err(customerResult.error);
    }
    const customerEmail = customerResult.value?.email ?? 'unknown@example.com';

    const chargeResult = await this.paymentGateway.charge({
      reference: transaction.id,
      amountInCents: transaction.totalInCents,
      currency: 'COP',
      customerEmail,
      card,
    });

    if (chargeResult.isErr) {
      transaction.markError();
      await this.transactionRepository.save(transaction);
      return err(chargeResult.error);
    }

    const charge = chargeResult.value;

    if (charge.status === 'APPROVED') {
      const stockResult = await this.applyStockDecrement(transaction);
      if (stockResult.isErr) {
        // Payment approved but stock could not be applied: record ERROR so the
        // inconsistency is visible rather than silently approving.
        transaction.markError();
        await this.transactionRepository.save(transaction);
        return err(stockResult.error);
      }
      transaction.markApproved(charge.gatewayTransactionId);
    } else if (charge.status === 'DECLINED') {
      transaction.markDeclined(charge.gatewayTransactionId);
    } else {
      transaction.markError();
    }

    const saved = await this.transactionRepository.save(transaction);
    if (saved.isErr) {
      return err(saved.error);
    }
    return ok(saved.value);
  }

  private async applyStockDecrement(
    transaction: Transaction,
  ): Promise<Result<true, ProcessPaymentError>> {
    const productResult = await this.productRepository.findById(
      transaction.productId,
    );
    if (productResult.isErr) {
      return err(productResult.error);
    }
    const product = productResult.value;
    if (product === null) {
      return err(new ProductNotFoundError(transaction.productId));
    }

    const decremented = product.decrementStock(transaction.quantity);
    if (decremented.isErr) {
      return err(decremented.error);
    }

    const savedProduct = await this.productRepository.save(decremented.value);
    if (savedProduct.isErr) {
      return err(savedProduct.error);
    }
    return ok(true);
  }
}
