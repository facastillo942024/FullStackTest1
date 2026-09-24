import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PAYMENT_GATEWAY } from '../../domain/ports/payment-gateway.port';
import { WompiPaymentGateway } from './wompi-payment.gateway';
import { WOMPI_CONFIG, WompiConfig } from './wompi.config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: WOMPI_CONFIG,
      inject: [ConfigService],
      useFactory: (config: ConfigService): WompiConfig => ({
        baseUrl: config.get<string>('GATEWAY_BASE_URL', ''),
        publicKey: config.get<string>('GATEWAY_PUBLIC_KEY', ''),
        privateKey: config.get<string>('GATEWAY_PRIVATE_KEY', ''),
        integritySecret: config.get<string>('GATEWAY_INTEGRITY_KEY', ''),
        maxStatusPolls: config.get<number>('GATEWAY_MAX_STATUS_POLLS', 8),
        pollIntervalMs: config.get<number>('GATEWAY_POLL_INTERVAL_MS', 1500),
      }),
    },
    {
      provide: PAYMENT_GATEWAY,
      inject: [WOMPI_CONFIG],
      useFactory: (wompiConfig: WompiConfig) =>
        new WompiPaymentGateway(wompiConfig),
    },
  ],
  exports: [PAYMENT_GATEWAY],
})
export class PaymentGatewayModule {}
