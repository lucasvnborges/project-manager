import { ProjectStatus } from '@repo/shared-types';
import { DomainException } from '../../common/exceptions/domain.exception';

export class InvalidStatusTransitionException extends DomainException {
  constructor(from: ProjectStatus, to: ProjectStatus) {
    super(
      `Transicao de status invalida: nao e permitido ir de "${from}" para "${to}".`,
    );
  }
}
