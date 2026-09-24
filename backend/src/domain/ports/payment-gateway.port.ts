import { Result } from '../result/result';
import { Card } from '../value-objects/card';
import { PaymentGatewayError } from '../errors/domain-error';

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export interface ChargeRequest {
  /** Internal reference (our transaction id) sent to the gateway. */
  reference: string;
  amountInCents: number;
  currency: string;
  customerEmail: string;
  card: Card;
  installments?: number;
}

export type GatewayPaymentStatus =
  'APPROVED' | 'DECLINED' | 'PENDING' | 'ERROR';

export interface ChargeResult {
  gatewayTransactionId: string;
  status: GatewayPaymentStatus;
  /** Optional human readable message returned by the gateway. */
  message?: string;
}

/**
 * Outbound port for the payment provider. The concrete adapter (Wompi) lives in
 * the infrastructure layer, keeping the domain independent of the vendor.
 */
export interface PaymentGatewayPort {
  /**
   * Runs the full charge flow: acceptance token -> card tokenization ->
   * create transaction -> poll final status. Returns the settled result.
   */
  charge(
    request: ChargeRequest,
  ): Promise<Result<ChargeResult, PaymentGatewayError>>;
}
