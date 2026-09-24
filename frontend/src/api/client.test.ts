import { AxiosError } from 'axios';
import { extractApiErrorMessage, resolveBaseUrl } from './client';

describe('extractApiErrorMessage', () => {
  it('reads message from an axios error response body', () => {
    const err = new AxiosError('Request failed');
    // @ts-expect-error partial response for the test
    err.response = { data: { message: 'Producto no encontrado' } };
    expect(extractApiErrorMessage(err)).toBe('Producto no encontrado');
  });

  it('falls back to the axios error message', () => {
    const err = new AxiosError('Network Error');
    expect(extractApiErrorMessage(err)).toBe('Network Error');
  });

  it('handles a plain Error', () => {
    expect(extractApiErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('handles an unknown value', () => {
    expect(extractApiErrorMessage(42)).toBe('Ocurrió un error inesperado');
  });
});

describe('resolveBaseUrl', () => {
  it('returns a string base url', () => {
    expect(typeof resolveBaseUrl()).toBe('string');
  });
});
