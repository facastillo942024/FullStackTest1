import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '../../../domain/errors/domain-error';

/**
 * Thrown by controllers to lift a domain error onto the HTTP layer. Keeps the
 * controllers thin: they translate a failed Result into this exception and the
 * filter maps it to the proper status + body.
 */
export class DomainHttpException extends Error {
  constructor(public readonly domainError: DomainError) {
    super(domainError.message);
  }
}

@Catch(DomainHttpException, HttpException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainHttpException | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof DomainHttpException) {
      const { domainError } = exception;
      response.status(domainError.httpStatus).json({
        statusCode: domainError.httpStatus,
        code: domainError.code,
        message: domainError.message,
      });
      return;
    }

    // Fallback for NestJS HttpExceptions (e.g. validation pipe errors).
    const status = exception.getStatus();
    const payload = exception.getResponse();
    response
      .status(status)
      .json(
        typeof payload === 'string'
          ? { statusCode: status, code: 'HTTP_ERROR', message: payload }
          : { statusCode: status, code: 'HTTP_ERROR', ...(payload as object) },
      );
  }
}

/** Default mapping helper kept for completeness / reuse. */
export const httpStatusForDomainError = (error: DomainError): number =>
  error.httpStatus ?? HttpStatus.INTERNAL_SERVER_ERROR;
