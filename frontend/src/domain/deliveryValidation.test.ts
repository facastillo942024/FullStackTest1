import { validateCustomer, validateDelivery } from './deliveryValidation';

describe('validateCustomer', () => {
  const valid = {
    fullName: 'Juan Perez',
    email: 'juan@example.com',
    phoneNumber: '3001112233',
  };

  it('passes with valid data', () => {
    expect(validateCustomer(valid)).toEqual({});
  });
  it('fails on short name', () => {
    expect(validateCustomer({ ...valid, fullName: 'Jo' }).fullName).toBeDefined();
  });
  it('fails on bad email', () => {
    expect(validateCustomer({ ...valid, email: 'nope' }).email).toBeDefined();
  });
  it('fails on short phone', () => {
    expect(
      validateCustomer({ ...valid, phoneNumber: '123' }).phoneNumber,
    ).toBeDefined();
  });
});

describe('validateDelivery', () => {
  const valid = {
    addressLine: 'Calle 123 # 45-67',
    city: 'Bogota',
    region: 'Cundinamarca',
    postalCode: '110111',
  };

  it('passes with valid data', () => {
    expect(validateDelivery(valid)).toEqual({});
  });
  it('fails on short address', () => {
    expect(
      validateDelivery({ ...valid, addressLine: 'abc' }).addressLine,
    ).toBeDefined();
  });
  it('fails on short city', () => {
    expect(validateDelivery({ ...valid, city: 'a' }).city).toBeDefined();
  });
  it('fails on short region', () => {
    expect(validateDelivery({ ...valid, region: 'x' }).region).toBeDefined();
  });
  it('fails on bad postal code', () => {
    expect(
      validateDelivery({ ...valid, postalCode: 'abc' }).postalCode,
    ).toBeDefined();
  });
});
