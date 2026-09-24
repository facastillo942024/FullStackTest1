import { ConfigService } from '@nestjs/config';
import { UuidIdGenerator } from './uuid-id-generator';
import { ConfigFeesProvider } from './config-fees.provider';

describe('UuidIdGenerator', () => {
  it('generates unique UUID v4 strings', () => {
    const gen = new UuidIdGenerator();
    const a = gen.generate();
    const b = gen.generate();
    expect(a).not.toBe(b);
    expect(a).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});

describe('ConfigFeesProvider', () => {
  it('reads fees from the config service', () => {
    const config = {
      get: jest.fn((key: string, def: number) =>
        key === 'BASE_FEE_IN_CENTS' ? 700 : def,
      ),
    } as unknown as ConfigService;
    const provider = new ConfigFeesProvider(config);
    expect(provider.getBaseFeeInCents()).toBe(700);
    expect(provider.getDeliveryFeeInCents()).toBe(1500000);
  });
});
