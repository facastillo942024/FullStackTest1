import { apiClient } from './client';
import { checkoutApi } from './checkoutApi';

jest.mock('./client', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
  extractApiErrorMessage: jest.fn(),
}));

const mockedGet = apiClient.get as jest.Mock;
const mockedPost = apiClient.post as jest.Mock;

describe('checkoutApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getProducts calls GET /products', async () => {
    mockedGet.mockResolvedValue({ data: [{ id: 'p1' }] });
    const result = await checkoutApi.getProducts();
    expect(mockedGet).toHaveBeenCalledWith('/products');
    expect(result).toEqual([{ id: 'p1' }]);
  });

  it('getProduct calls GET /products/:id', async () => {
    mockedGet.mockResolvedValue({ data: { id: 'p1' } });
    await checkoutApi.getProduct('p1');
    expect(mockedGet).toHaveBeenCalledWith('/products/p1');
  });

  it('createTransaction calls POST /transactions', async () => {
    mockedPost.mockResolvedValue({ data: { id: 't1' } });
    const payload = {
      productId: 'p1',
      quantity: 1,
      customer: { fullName: 'A', email: 'a@e.com', phoneNumber: '1' },
      delivery: { addressLine: 'x', city: 'y', region: 'z', postalCode: '1' },
    };
    await checkoutApi.createTransaction(payload);
    expect(mockedPost).toHaveBeenCalledWith('/transactions', payload);
  });

  it('payTransaction calls POST /transactions/:id/pay', async () => {
    mockedPost.mockResolvedValue({ data: { id: 't1', status: 'APPROVED' } });
    const payload = {
      card: {
        number: '4242',
        cvc: '123',
        expMonth: '08',
        expYear: '30',
        cardHolder: 'A',
      },
    };
    await checkoutApi.payTransaction('t1', payload);
    expect(mockedPost).toHaveBeenCalledWith('/transactions/t1/pay', payload);
  });

  it('getTransaction calls GET /transactions/:id', async () => {
    mockedGet.mockResolvedValue({ data: { id: 't1' } });
    await checkoutApi.getTransaction('t1');
    expect(mockedGet).toHaveBeenCalledWith('/transactions/t1');
  });
});
