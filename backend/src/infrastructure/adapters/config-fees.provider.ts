import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FeesProviderPort } from '../../domain/ports/fees.port';

@Injectable()
export class ConfigFeesProvider implements FeesProviderPort {
  constructor(private readonly config: ConfigService) {}

  getBaseFeeInCents(): number {
    // Env vars arrive as strings; coerce to a number so downstream arithmetic
    // does not accidentally concatenate.
    return Number(this.config.get('BASE_FEE_IN_CENTS', 500000));
  }

  getDeliveryFeeInCents(): number {
    return Number(this.config.get('DELIVERY_FEE_IN_CENTS', 1500000));
  }
}
