import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common/exceptions/domain.exception';

export class InvalidDateRangeException extends DomainException {
  constructor() {
    super(
      'A previsao de termino deve ser posterior a data de inicio.',
      HttpStatus.BAD_REQUEST,
    );
  }
}
