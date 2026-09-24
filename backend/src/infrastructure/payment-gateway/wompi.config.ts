export const WOMPI_CONFIG = Symbol('WOMPI_CONFIG');

export interface WompiConfig {
  baseUrl: string;
  publicKey: string;
  privateKey: string;
  integritySecret: string;
  /** How many times to poll the transaction status before giving up. */
  maxStatusPolls: number;
  /** Delay between status polls in milliseconds. */
  pollIntervalMs: number;
}
