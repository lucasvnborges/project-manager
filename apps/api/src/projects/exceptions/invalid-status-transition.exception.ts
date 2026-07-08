import { HttpStatus } from '@nestjs/common';
import { PROJECT_STATUS_LABELS, ProjectStatus } from '@repo/shared-types';
import { DomainException } from '../../common/exceptions/domain.exception';

export class InvalidStatusTransitionException extends DomainException {
  constructor(from: ProjectStatus, to: ProjectStatus) {
    super(
      `Transição de status inválida: não é permitido ir de "${PROJECT_STATUS_LABELS[from]}" para "${PROJECT_STATUS_LABELS[to]}".`,
      HttpStatus.CONFLICT,
    );
  }
}
