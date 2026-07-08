import { HttpStatus } from '@nestjs/common';
import { PROJECT_STATUS_LABELS, ProjectStatus } from '@repo/shared-types';
import { DomainException } from '../../common/exceptions/domain.exception';

export class ProjectEditionNotAllowedException extends DomainException {
  constructor(status: ProjectStatus) {
    super(
      `Projetos com status "${PROJECT_STATUS_LABELS[status]}" não podem ser editados.`,
      HttpStatus.CONFLICT,
    );
  }
}
