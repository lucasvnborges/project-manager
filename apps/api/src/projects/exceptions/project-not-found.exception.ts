import { DomainException } from '../../common/exceptions/domain.exception';

export class ProjectNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Projeto com id "${id}" nao foi encontrado.`);
  }
}
