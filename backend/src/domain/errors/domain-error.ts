/**
 * Base class for all domain-level failures. Each error carries a stable `code`
 * (used by the HTTP layer to map to a status) and a human-readable message.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ProductNotFoundError extends DomainError {
  readonly code = 'PRODUCT_NOT_FOUND';
  readonly httpStatus = 404;

  constructor(productId: string) {
    super(`Product with id "${productId}" was not found`);
  }
}

export class InsufficientStockError extends DomainError {
  readonly code = 'INSUFFICIENT_STOCK';
  readonly httpStatus = 409;

  constructor(available: number, requested: number) {
    super(
      `Insufficient stock: requested ${requested} but only ${available} available`,
    );
  }
}

export class TransactionNotFoundError extends DomainError {
  readonly code = 'TRANSACTION_NOT_FOUND';
  readonly httpStatus = 404;

  constructor(transactionId: string) {
    super(`Transaction with id "${transactionId}" was not found`);
  }
}

export class InvalidCardError extends DomainError {
  readonly code = 'INVALID_CARD';
  readonly httpStatus = 422;

  constructor(reason: string) {
    super(`Invalid card data: ${reason}`);
  }
}

export class PaymentGatewayError extends DomainError {
  readonly code = 'PAYMENT_GATEWAY_ERROR';
  readonly httpStatus = 502;

  constructor(reason: string) {
    super(`Payment gateway error: ${reason}`);
  }
}

export class PersistenceError extends DomainError {
  readonly code = 'PERSISTENCE_ERROR';
  readonly httpStatus = 500;

  constructor(reason: string) {
    super(`Persistence error: ${reason}`);
  }
}

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly httpStatus = 400;

  constructor(reason: string) {
    super(`Validation error: ${reason}`);
  }
}
