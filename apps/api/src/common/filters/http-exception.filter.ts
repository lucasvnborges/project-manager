import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ApiErrorResponse } from '@repo/shared-types';
import type { Request, Response } from 'express';
import { DomainException } from '../exceptions/domain.exception';

const REASON_PHRASES: Partial<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: 'Bad Request',
  [HttpStatus.NOT_FOUND]: 'Not Found',
  [HttpStatus.CONFLICT]: 'Conflict',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
};

interface ResolvedError {
  statusCode: number;
  message: string | string[];
  error: string;
}

/**
 * Filtro global de excecoes: traduz DomainException (regras de negocio),
 * HttpException do Nest (ex.: erros de validacao do ValidationPipe) e
 * qualquer erro inesperado para um formato de resposta unico e
 * previsivel (ApiErrorResponse), evitando que cada controller precise
 * tratar erros individualmente.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const resolved = this.resolve(exception);

    const body: ApiErrorResponse = {
      ...resolved,
      timestamp: new Date().toISOString(),
      path: request.originalUrl ?? request.url,
    };

    response.status(resolved.statusCode).json(body);
  }

  private resolve(exception: unknown): ResolvedError {
    if (exception instanceof DomainException) {
      return {
        statusCode: exception.httpStatus,
        message: exception.message,
        error: REASON_PHRASES[exception.httpStatus] ?? exception.name,
      };
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        return {
          statusCode,
          message: payload,
          error: REASON_PHRASES[statusCode] ?? exception.name,
        };
      }

      const payloadObject = payload as Record<string, unknown>;
      return {
        statusCode,
        message:
          (payloadObject.message as string | string[]) ?? exception.message,
        error:
          (payloadObject.error as string) ??
          REASON_PHRASES[statusCode] ??
          exception.name,
      };
    }

    this.logger.error(
      'Erro nao tratado',
      exception instanceof Error ? exception.stack : exception,
    );

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro interno inesperado.',
      error: REASON_PHRASES[HttpStatus.INTERNAL_SERVER_ERROR]!,
    };
  }
}
