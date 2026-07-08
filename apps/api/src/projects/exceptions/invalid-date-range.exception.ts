import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common/exceptions/domain.exception';

export class InvalidDateRangeException extends DomainException {
  constructor() {
    super(
      'A previsão de término deve ser posterior à data de início.',
      HttpStatus.BAD_REQUEST,
    );
  }
}
