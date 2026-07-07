import { Injectable } from '@nestjs/common';
import { isStatusTransitionAllowed, ProjectStatus } from '@repo/shared-types';
import { InvalidStatusTransitionException } from '../exceptions/invalid-status-transition.exception';

/**
 * Garante que a transicao de status de um projeto respeita a maquina de
 * estados fixa definida em @repo/shared-types (PROJECT_STATUS_TRANSITIONS):
 *
 *   EM_ANALISE -> APROVADO -> EM_ANDAMENTO -> ENCERRADO
 *   Qualquer status (exceto ENCERRADO/CANCELADO) -> CANCELADO
 *
 * Nao e permitido pular etapas, e ENCERRADO/CANCELADO sao estados
 * terminais (nenhuma transicao e permitida a partir deles).
 */
@Injectable()
export class StatusTransitionValidator {
  assertTransitionIsAllowed(from: ProjectStatus, to: ProjectStatus): void {
    if (!isStatusTransitionAllowed(from, to)) {
      throw new InvalidStatusTransitionException(from, to);
    }
  }
}
