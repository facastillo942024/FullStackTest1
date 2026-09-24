/**
 * Lightweight environment validation. Ensures required variables are present
 * and numeric values are coerced. Throws at bootstrap if anything is missing,
 * failing fast instead of at first request.
 */
export interface AppEnv {
  NODE_ENV: string;
  PORT: number;
  CORS_ORIGINS: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_SYNCHRONIZE: boolean;
  DB_LOGGING: boolean;
  GATEWAY_BASE_URL: string;
  GATEWAY_PUBLIC_KEY: string;
  GATEWAY_PRIVATE_KEY: string;
  GATEWAY_INTEGRITY_KEY: string;
  BASE_FEE_IN_CENTS: number;
  DELIVERY_FEE_IN_CENTS: number;
}

const asBool = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
};

const asNumber = (value: string | undefined, fallback: number): number => {
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export function validateEnv(
  config: Record<string, string | undefined>,
): AppEnv {
  const required = [
    'DB_HOST',
    'DB_USERNAME',
    'DB_NAME',
    'GATEWAY_BASE_URL',
    'GATEWAY_PUBLIC_KEY',
    'GATEWAY_PRIVATE_KEY',
    'GATEWAY_INTEGRITY_KEY',
  ];

  const missing = required.filter(
    (key) => config[key] === undefined || config[key] === '',
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }

  return {
    NODE_ENV: config.NODE_ENV ?? 'development',
    PORT: asNumber(config.PORT, 3000),
    CORS_ORIGINS: config.CORS_ORIGINS ?? '*',
    DB_HOST: config.DB_HOST as string,
    DB_PORT: asNumber(config.DB_PORT, 5432),
    DB_USERNAME: config.DB_USERNAME as string,
    DB_PASSWORD: config.DB_PASSWORD ?? '',
    DB_NAME: config.DB_NAME as string,
    DB_SYNCHRONIZE: asBool(config.DB_SYNCHRONIZE, false),
    DB_LOGGING: asBool(config.DB_LOGGING, false),
    GATEWAY_BASE_URL: config.GATEWAY_BASE_URL as string,
    GATEWAY_PUBLIC_KEY: config.GATEWAY_PUBLIC_KEY as string,
    GATEWAY_PRIVATE_KEY: config.GATEWAY_PRIVATE_KEY as string,
    GATEWAY_INTEGRITY_KEY: config.GATEWAY_INTEGRITY_KEY as string,
    BASE_FEE_IN_CENTS: asNumber(config.BASE_FEE_IN_CENTS, 500000),
    DELIVERY_FEE_IN_CENTS: asNumber(config.DELIVERY_FEE_IN_CENTS, 1500000),
  };
}
