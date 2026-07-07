/**
 * Classe base para exceptions de regra de negocio (dominio), desacopladas
 * do framework HTTP. Servicos e validadores lancam subclasses concretas;
 * o HttpExceptionFilter global e responsavel por traduzi-las para a
 * resposta HTTP correta (ver common/filters/http-exception.filter.ts).
 */
export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
