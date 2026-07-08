import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common/exceptions/domain.exception';

export class ProjectNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Projeto com id "${id}" não foi encontrado.`, HttpStatus.NOT_FOUND);
  }
}
