export const FEES_PROVIDER = Symbol('FEES_PROVIDER');

/**
 * Provides the business fees applied on top of the product price. Kept as a
 * port so fees can be configured via environment without leaking config into
 * the domain/use cases.
 */
export interface FeesProviderPort {
  getBaseFeeInCents(): number;
  getDeliveryFeeInCents(): number;
}
