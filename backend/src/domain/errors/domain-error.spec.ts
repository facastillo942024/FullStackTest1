import {
  InsufficientStockError,
  InvalidCardError,
  PaymentGatewayError,
  PersistenceError,
  ProductNotFoundError,
  TransactionNotFoundError,
  ValidationError,
} from './domain-error';

describe('Domain errors', () => {
  it('ProductNotFoundError has 404 and code', () => {
    const e = new ProductNotFoundError('p1');
    expect(e.httpStatus).toBe(404);
    expect(e.code).toBe('PRODUCT_NOT_FOUND');
    expect(e.message).toContain('p1');
  });

  it('InsufficientStockError has 409 and details', () => {
    const e = new InsufficientStockError(2, 5);
    expect(e.httpStatus).toBe(409);
    expect(e.message).toContain('5');
    expect(e.message).toContain('2');
  });

  it('TransactionNotFoundError has 404', () => {
    expect(new TransactionNotFoundError('t1').httpStatus).toBe(404);
  });

  it('InvalidCardError has 422', () => {
    expect(new InvalidCardError('bad').httpStatus).toBe(422);
  });

  it('PaymentGatewayError has 502', () => {
    expect(new PaymentGatewayError('down').httpStatus).toBe(502);
  });

  it('PersistenceError has 500', () => {
    expect(new PersistenceError('db').httpStatus).toBe(500);
  });

  it('ValidationError has 400', () => {
    expect(new ValidationError('nope').httpStatus).toBe(400);
  });
});
