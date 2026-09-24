import { Inject, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import axios, { AxiosInstance } from 'axios';
import { Result, err, ok } from '../../domain/result/result';
import { PaymentGatewayError } from '../../domain/errors/domain-error';
import {
  ChargeRequest,
  ChargeResult,
  GatewayPaymentStatus,
  PaymentGatewayPort,
} from '../../domain/ports/payment-gateway.port';
import { WOMPI_CONFIG, WompiConfig } from './wompi.config';
import {
  WompiCardTokenResponse,
  WompiMerchantResponse,
  WompiTransactionResponse,
  WompiTransactionStatus,
} from './wompi.types';

/**
 * Wompi (Sandbox/UAT) adapter implementing the PaymentGatewayPort.
 *
 * Charge flow:
 *   1. GET  /merchants/{publicKey}  -> acceptance_token
 *   2. POST /tokens/cards           -> card token (Bearer public key)
 *   3. compute integrity signature  = SHA256(reference + amount + currency + secret)
 *   4. POST /transactions           -> creates the charge (Bearer private key)
 *   5. poll GET /transactions/{id}  -> until a final status is reached
 *
 * Every network error is captured on the ROP error track as a
 * PaymentGatewayError; nothing throws out of this adapter.
 */
@Injectable()
export class WompiPaymentGateway implements PaymentGatewayPort {
  private readonly logger = new Logger(WompiPaymentGateway.name);
  private readonly http: AxiosInstance;

  constructor(
    @Inject(WOMPI_CONFIG) private readonly config: WompiConfig,
    http?: AxiosInstance,
  ) {
    this.http =
      http ??
      axios.create({
        baseURL: config.baseUrl,
        timeout: 15000,
      });
  }

  async charge(
    request: ChargeRequest,
  ): Promise<Result<ChargeResult, PaymentGatewayError>> {
    try {
      const acceptanceToken = await this.fetchAcceptanceToken();
      const cardToken = await this.tokenizeCard(request);
      const signature = this.buildSignature(
        request.reference,
        request.amountInCents,
        request.currency,
      );

      const created = await this.createTransaction({
        request,
        acceptanceToken,
        cardToken,
        signature,
      });

      const finalStatus = await this.pollUntilFinal(created.data.id);

      return ok({
        gatewayTransactionId: finalStatus.data.id,
        status: this.mapStatus(finalStatus.data.status),
        message: finalStatus.data.status_message ?? undefined,
      });
    } catch (reason) {
      const message = this.describeError(reason);
      this.logger.error(`Charge failed: ${message}`);
      return err(new PaymentGatewayError(message));
    }
  }

  private async fetchAcceptanceToken(): Promise<string> {
    const { data } = await this.http.get<WompiMerchantResponse>(
      `/merchants/${this.config.publicKey}`,
    );
    return data.data.presigned_acceptance.acceptance_token;
  }

  private async tokenizeCard(request: ChargeRequest): Promise<string> {
    const { data } = await this.http.post<WompiCardTokenResponse>(
      '/tokens/cards',
      {
        number: request.card.number,
        cvc: request.card.cvc,
        exp_month: request.card.expMonth,
        exp_year: request.card.expYear,
        card_holder: request.card.cardHolder,
      },
      {
        headers: { Authorization: `Bearer ${this.config.publicKey}` },
      },
    );
    return data.data.id;
  }

  private buildSignature(
    reference: string,
    amountInCents: number,
    currency: string,
  ): string {
    const raw = `${reference}${amountInCents}${currency}${this.config.integritySecret}`;
    return createHash('sha256').update(raw).digest('hex');
  }

  private async createTransaction(params: {
    request: ChargeRequest;
    acceptanceToken: string;
    cardToken: string;
    signature: string;
  }): Promise<WompiTransactionResponse> {
    const { request, acceptanceToken, cardToken, signature } = params;
    const { data } = await this.http.post<WompiTransactionResponse>(
      '/transactions',
      {
        amount_in_cents: request.amountInCents,
        currency: request.currency,
        customer_email: request.customerEmail,
        reference: request.reference,
        acceptance_token: acceptanceToken,
        signature,
        payment_method: {
          type: 'CARD',
          token: cardToken,
          installments: request.installments ?? 1,
        },
      },
      {
        headers: { Authorization: `Bearer ${this.config.privateKey}` },
      },
    );
    return data;
  }

  private async pollUntilFinal(
    transactionId: string,
  ): Promise<WompiTransactionResponse> {
    let last: WompiTransactionResponse | null = null;
    for (let attempt = 0; attempt < this.config.maxStatusPolls; attempt++) {
      const { data } = await this.http.get<WompiTransactionResponse>(
        `/transactions/${transactionId}`,
      );
      last = data;
      if (data.data.status !== 'PENDING') {
        return data;
      }
      await this.delay(this.config.pollIntervalMs);
    }
    if (last === null) {
      throw new Error('no status response received from gateway');
    }
    return last;
  }

  private mapStatus(status: WompiTransactionStatus): GatewayPaymentStatus {
    switch (status) {
      case 'APPROVED':
        return 'APPROVED';
      case 'DECLINED':
      case 'VOIDED':
        return 'DECLINED';
      case 'PENDING':
        return 'PENDING';
      default:
        return 'ERROR';
    }
  }

  private delay(ms: number): Promise<void> {
    if (ms <= 0) {
      return Promise.resolve();
    }
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private describeError(reason: unknown): string {
    if (axios.isAxiosError(reason)) {
      const status = reason.response?.status;
      const body = reason.response?.data;
      const detail =
        body && typeof body === 'object'
          ? JSON.stringify((body as { error?: unknown }).error ?? body)
          : String(body ?? '');
      return `HTTP ${status ?? 'unknown'} ${detail}`.trim();
    }
    if (reason instanceof Error) {
      return reason.message;
    }
    return String(reason);
  }
}
