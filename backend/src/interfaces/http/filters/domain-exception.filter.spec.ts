import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import {
  DomainExceptionFilter,
  DomainHttpException,
  httpStatusForDomainError,
} from './domain-exception.filter';
import {
  ProductNotFoundError,
  ValidationError,
} from '../../../domain/errors/domain-error';

const makeHost = () => {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
};

describe('DomainExceptionFilter', () => {
  const filter = new DomainExceptionFilter();

  it('maps a DomainHttpException to its status and code', () => {
    const { host, status, json } = makeHost();
    filter.catch(new DomainHttpException(new ProductNotFoundError('p1')), host);
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'PRODUCT_NOT_FOUND', statusCode: 404 }),
    );
  });

  it('maps a validation domain error to 400', () => {
    const { host, status } = makeHost();
    filter.catch(new DomainHttpException(new ValidationError('bad')), host);
    expect(status).toHaveBeenCalledWith(400);
  });

  it('handles a NestJS HttpException with string payload', () => {
    const { host, status, json } = makeHost();
    filter.catch(new HttpException('nope', HttpStatus.BAD_REQUEST), host);
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'HTTP_ERROR', message: 'nope' }),
    );
  });

  it('handles a NestJS HttpException with object payload', () => {
    const { host, status, json } = makeHost();
    filter.catch(
      new HttpException({ message: ['a', 'b'] }, HttpStatus.BAD_REQUEST),
      host,
    );
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalled();
  });

  it('httpStatusForDomainError returns the mapped status', () => {
    expect(httpStatusForDomainError(new ProductNotFoundError('p'))).toBe(404);
  });
});
