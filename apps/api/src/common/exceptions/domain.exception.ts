import { HttpStatus } from '@nestjs/common';

/**
 * Classe base para exceptions de regra de negocio (dominio), desacopladas
 * do framework HTTP. Cada subclasse concreta declara o HttpStatus
 * correspondente; o HttpExceptionFilter global le essa informacao para
 * montar a resposta HTTP (ver common/filters/http-exception.filter.ts),
 * sem precisar conhecer cada subclasse individualmente.
 */
export abstract class DomainException extends Error {
  constructor(
    message: string,
    readonly httpStatus: HttpStatus,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
