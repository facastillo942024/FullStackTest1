import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns ok status with a timestamp', () => {
    const result = new HealthController().check();
    expect(result.status).toBe('ok');
    expect(typeof result.timestamp).toBe('string');
  });
});
