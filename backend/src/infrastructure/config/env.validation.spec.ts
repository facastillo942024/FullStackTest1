import { validateEnv } from './env.validation';

const baseEnv = {
  DB_HOST: 'localhost',
  DB_USERNAME: 'postgres',
  DB_NAME: 'checkout_db',
  GATEWAY_BASE_URL: 'https://gw',
  GATEWAY_PUBLIC_KEY: 'pub',
  GATEWAY_PRIVATE_KEY: 'prv',
  GATEWAY_INTEGRITY_KEY: 'int',
};

describe('validateEnv', () => {
  it('returns coerced values with defaults', () => {
    const env = validateEnv(baseEnv);
    expect(env.PORT).toBe(3000);
    expect(env.DB_PORT).toBe(5432);
    expect(env.DB_SYNCHRONIZE).toBe(false);
    expect(env.BASE_FEE_IN_CENTS).toBe(500000);
  });

  it('coerces numeric and boolean strings', () => {
    const env = validateEnv({
      ...baseEnv,
      PORT: '4000',
      DB_PORT: '6000',
      DB_SYNCHRONIZE: 'true',
      DB_LOGGING: '1',
      BASE_FEE_IN_CENTS: '999',
    });
    expect(env.PORT).toBe(4000);
    expect(env.DB_PORT).toBe(6000);
    expect(env.DB_SYNCHRONIZE).toBe(true);
    expect(env.DB_LOGGING).toBe(true);
    expect(env.BASE_FEE_IN_CENTS).toBe(999);
  });

  it('falls back on invalid numeric input', () => {
    const env = validateEnv({ ...baseEnv, PORT: 'not-a-number' });
    expect(env.PORT).toBe(3000);
  });

  it('throws when a required variable is missing', () => {
    expect(() =>
      validateEnv({ ...baseEnv, GATEWAY_PUBLIC_KEY: undefined }),
    ).toThrow(/Missing required/);
  });
});
