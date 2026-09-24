import { Inject, Injectable } from '@nestjs/common';
import { Result, err, ok } from '../../domain/result/result';
import { Transaction } from '../../domain/entities/transaction';
import { Customer } from '../../domain/entities/customer';
import { Delivery } from '../../domain/entities/delivery';
import {
  InsufficientStockError,
  PersistenceError,
  ProductNotFoundError,
  ValidationError,
} from '../../domain/errors/domain-error';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../../domain/ports/product.repository';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepository,
} from '../../domain/ports/customer.repository';
import {
  DELIVERY_REPOSITORY,
  DeliveryRepository,
} from '../../domain/ports/delivery.repository';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepository,
} from '../../domain/ports/transaction.repository';
import {
  ID_GENERATOR,
  IdGeneratorPort,
} from '../../domain/ports/id-generator.port';
import { FEES_PROVIDER, FeesProviderPort } from '../../domain/ports/fees.port';
import { CreateTransactionCommand } from '../commands';

export type CreateTransactionError =
  | ValidationError
  | ProductNotFoundError
  | InsufficientStockError
  | PersistenceError;

/**
 * Creates a PENDING transaction together with its customer and delivery
 * records. Validates the product exists and has enough stock, but does NOT
 * decrement stock yet — that happens only after a successful payment.
 *
 * The flow is expressed as a Railway pipeline: any failure short-circuits and
 * is returned on the error track.
 */
@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepository,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
    @Inject(ID_GENERATOR)
    private readonly idGenerator: IdGeneratorPort,
    @Inject(FEES_PROVIDER)
    private readonly fees: FeesProviderPort,
  ) {}

  async execute(
    command: CreateTransactionCommand,
  ): Promise<Result<Transaction, CreateTransactionError>> {
    if (!Number.isInteger(command.quantity) || command.quantity <= 0) {
      return err(new ValidationError('quantity must be a positive integer'));
    }

    const productResult = await this.productRepository.findById(
      command.productId,
    );
    if (productResult.isErr) {
      return err(productResult.error);
    }
    const product = productResult.value;
    if (product === null) {
      return err(new ProductNotFoundError(command.productId));
    }

    if (!product.hasStock(command.quantity)) {
      return err(new InsufficientStockError(product.stock, command.quantity));
    }

    const customer = new Customer({
      id: this.idGenerator.generate(),
      fullName: command.customer.fullName,
      email: command.customer.email,
      phoneNumber: command.customer.phoneNumber,
    });
    const savedCustomer = await this.customerRepository.save(customer);
    if (savedCustomer.isErr) {
      return err(savedCustomer.error);
    }

    const delivery = new Delivery({
      id: this.idGenerator.generate(),
      customerId: customer.id,
      addressLine: command.delivery.addressLine,
      city: command.delivery.city,
      region: command.delivery.region,
      postalCode: command.delivery.postalCode,
    });
    const savedDelivery = await this.deliveryRepository.save(delivery);
    if (savedDelivery.isErr) {
      return err(savedDelivery.error);
    }

    const amountInCents = product.priceInCents * command.quantity;
    const transaction = new Transaction({
      id: this.idGenerator.generate(),
      customerId: customer.id,
      productId: product.id,
      deliveryId: delivery.id,
      quantity: command.quantity,
      amountInCents,
      baseFeeInCents: this.fees.getBaseFeeInCents(),
      deliveryFeeInCents: this.fees.getDeliveryFeeInCents(),
      status: 'PENDING',
    });

    const savedTransaction = await this.transactionRepository.save(transaction);
    if (savedTransaction.isErr) {
      return err(savedTransaction.error);
    }

    return ok(savedTransaction.value);
  }
}
