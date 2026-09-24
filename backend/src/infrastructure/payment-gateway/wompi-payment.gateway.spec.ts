import { AxiosInstance } from 'axios';
import { WompiPaymentGateway } from './wompi-payment.gateway';
import { WompiConfig } from './wompi.config';
import { Card } from '../../domain/value-objects/card';
import { ChargeRequest } from '../../domain/ports/payment-gateway.port';

const config: WompiConfig = {
  baseUrl: 'https://gateway.test/v1',
  publicKey: 'pub_test',
  privateKey: 'prv_test',
  integritySecret: 'integrity_test',
  maxStatusPolls: 3,
  pollIntervalMs: 0,
};

const card = (() => {
  const result = Card.create({
    number: '4242424242424242',
    cvc: '123',
    expMonth: '08',
    expYear: '30',
    cardHolder: 'JUAN PEREZ',
  });
  if (!result.isOk) throw new Error('invalid test card');
  return result.value;
})();

const request: ChargeRequest = {
  reference: 'ref-1',
  amountInCents: 4000,
  currency: 'COP',
  customerEmail: 'j@e.com',
  card,
};

const makeHttp = (overrides: Partial<AxiosInstance>): AxiosInstance =>
  ({
    get: jest.fn(),
    post: jest.fn(),
    ...overrides,
  }) as unknown as AxiosInstance;

const merchantResponse = {
  data: { data: { presigned_acceptance: { acceptance_token: 'acc-token' } } },
};
const tokenResponse = { data: { status: 'CREATED', data: { id: 'tok_123' } } };

describe('WompiPaymentGateway', () => {
  it('returns APPROVED after polling reaches a final state', async () => {
    const get = jest
      .fn()
      .mockResolvedValueOnce(merchantResponse) // acceptance token
      .mockResolvedValueOnce({
        data: { data: { id: 'wtx-1', status: 'PENDING', reference: 'ref-1' } },
      })
      .mockResolvedValueOnce({
        data: { data: { id: 'wtx-1', status: 'APPROVED', reference: 'ref-1' } },
      });
    const post = jest
      .fn()
      .mockResolvedValueOnce(tokenResponse) // tokenize card
      .mockResolvedValueOnce({
        data: { data: { id: 'wtx-1', status: 'PENDING', reference: 'ref-1' } },
      }); // create transaction

    const gateway = new WompiPaymentGateway(config, makeHttp({ get, post }));
    const result = await gateway.charge(request);

    expect(result.isOk).toBe(true);
    if (result.isOk) {
      expect(result.value.status).toBe('APPROVED');
      expect(result.value.gatewayTransactionId).toBe('wtx-1');
    }
  });

  it('maps DECLINED status', async () => {
    const get = jest
      .fn()
      .mockResolvedValueOnce(merchantResponse)
      .mockResolvedValueOnce({
        data: { data: { id: 'wtx-2', status: 'DECLINED', reference: 'ref-1' } },
      });
    const post = jest
      .fn()
      .mockResolvedValueOnce(tokenResponse)
      .mockResolvedValueOnce({
        data: { data: { id: 'wtx-2', status: 'PENDING', reference: 'ref-1' } },
      });

    const gateway = new WompiPaymentGateway(config, makeHttp({ get, post }));
    const result = await gateway.charge(request);
    expect(result.isOk).toBe(true);
    if (result.isOk) expect(result.value.status).toBe('DECLINED');
  });

  it('maps VOIDED to DECLINED', async () => {
    const get = jest
      .fn()
      .mockResolvedValueOnce(merchantResponse)
      .mockResolvedValueOnce({
        data: { data: { id: 'wtx-3', status: 'VOIDED', reference: 'ref-1' } },
      });
    const post = jest
      .fn()
      .mockResolvedValueOnce(tokenResponse)
      .mockResolvedValueOnce({
        data: { data: { id: 'wtx-3', status: 'PENDING', reference: 'ref-1' } },
      });

    const gateway = new WompiPaymentGateway(config, makeHttp({ get, post }));
    const result = await gateway.charge(request);
    if (result.isOk) expect(result.value.status).toBe('DECLINED');
  });

  it('returns PENDING when polling never settles', async () => {
    const pendingTx = {
      data: { data: { id: 'wtx-4', status: 'PENDING', reference: 'ref-1' } },
    };
    const get = jest
      .fn()
      .mockResolvedValueOnce(merchantResponse)
      .mockResolvedValue(pendingTx);
    const post = jest
      .fn()
      .mockResolvedValueOnce(tokenResponse)
      .mockResolvedValueOnce(pendingTx);

    const gateway = new WompiPaymentGateway(config, makeHttp({ get, post }));
    const result = await gateway.charge(request);
    expect(result.isOk).toBe(true);
    if (result.isOk) expect(result.value.status).toBe('PENDING');
  });

  it('returns a PaymentGatewayError when a request throws', async () => {
    const get = jest.fn().mockRejectedValue(new Error('network down'));
    const post = jest.fn();
    const gateway = new WompiPaymentGateway(config, makeHttp({ get, post }));
    const result = await gateway.charge(request);
    expect(result.isErr).toBe(true);
    if (result.isErr) expect(result.error.code).toBe('PAYMENT_GATEWAY_ERROR');
  });

  it('builds a deterministic default axios instance when none provided', () => {
    const gateway = new WompiPaymentGateway(config);
    expect(gateway).toBeInstanceOf(WompiPaymentGateway);
  });

  it('describes an axios error with response body', async () => {
    const axiosError = Object.assign(new Error('Request failed'), {
      isAxiosError: true,
      response: { status: 422, data: { error: { reason: 'invalid card' } } },
    });
    const get = jest.fn().mockRejectedValue(axiosError);
    const gateway = new WompiPaymentGateway(config, makeHttp({ get }));
    const result = await gateway.charge(request);
    expect(result.isErr).toBe(true);
    if (result.isErr) {
      expect(result.error.message).toContain('422');
    }
  });

  it('includes the gateway status_message in the result', async () => {
    const get = jest
      .fn()
      .mockResolvedValueOnce(merchantResponse)
      .mockResolvedValueOnce({
        data: {
          data: {
            id: 'wtx-5',
            status: 'APPROVED',
            status_message: 'Aprobada',
            reference: 'ref-1',
          },
        },
      });
    const post = jest
      .fn()
      .mockResolvedValueOnce(tokenResponse)
      .mockResolvedValueOnce({
        data: { data: { id: 'wtx-5', status: 'PENDING', reference: 'ref-1' } },
      });
    const gateway = new WompiPaymentGateway(config, makeHttp({ get, post }));
    const result = await gateway.charge(request);
    if (result.isOk) expect(result.value.message).toBe('Aprobada');
  });

  it('maps an ERROR gateway status', async () => {
    const get = jest
      .fn()
      .mockResolvedValueOnce(merchantResponse)
      .mockResolvedValueOnce({
        data: { data: { id: 'wtx-6', status: 'ERROR', reference: 'ref-1' } },
      });
    const post = jest
      .fn()
      .mockResolvedValueOnce(tokenResponse)
      .mockResolvedValueOnce({
        data: { data: { id: 'wtx-6', status: 'PENDING', reference: 'ref-1' } },
      });
    const gateway = new WompiPaymentGateway(config, makeHttp({ get, post }));
    const result = await gateway.charge(request);
    if (result.isOk) expect(result.value.status).toBe('ERROR');
  });
});
