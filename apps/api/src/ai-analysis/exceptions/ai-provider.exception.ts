import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../common/exceptions/domain.exception';

export class AiProviderException extends DomainException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_GATEWAY);
  }
}
