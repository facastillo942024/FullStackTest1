import { Transaction } from './transaction';

const makeTx = () =>
  new Transaction({
    id: 't1',
    customerId: 'c1',
    productId: 'p1',
    deliveryId: 'd1',
    quantity: 2,
    amountInCents: 2000,
    baseFeeInCents: 500,
    deliveryFeeInCents: 1500,
    status: 'PENDING',
  });

describe('Transaction entity', () => {
  it('computes the total including fees', () => {
    expect(makeTx().totalInCents).toBe(4000);
  });

  it('starts as not finalized', () => {
    expect(makeTx().isFinalized()).toBe(false);
  });

  it('links a gateway transaction id', () => {
    const tx = makeTx();
    tx.linkGatewayTransaction('gw-1');
    expect(tx.gatewayTransactionId).toBe('gw-1');
  });

  it('marks approved with a gateway id and finalizes', () => {
    const tx = makeTx();
    tx.markApproved('gw-approved');
    expect(tx.status).toBe('APPROVED');
    expect(tx.gatewayTransactionId).toBe('gw-approved');
    expect(tx.isFinalized()).toBe(true);
  });

  it('marks declined', () => {
    const tx = makeTx();
    tx.markDeclined('gw-declined');
    expect(tx.status).toBe('DECLINED');
    expect(tx.gatewayTransactionId).toBe('gw-declined');
  });

  it('marks error', () => {
    const tx = makeTx();
    tx.markError();
    expect(tx.status).toBe('ERROR');
    expect(tx.isFinalized()).toBe(true);
  });

  it('markApproved without id keeps existing gateway id', () => {
    const tx = makeTx();
    tx.linkGatewayTransaction('existing');
    tx.markApproved();
    expect(tx.gatewayTransactionId).toBe('existing');
  });

  it('updates updatedAt when state changes', () => {
    const tx = makeTx();
    const before = tx.updatedAt.getTime();
    tx.markApproved('x');
    expect(tx.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });
});
