import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ProjectStatus } from '@repo/shared-types';

export class ChangeProjectStatusDto {
  @ApiProperty({
    enum: ProjectStatus,
    example: ProjectStatus.APROVADO,
    description:
      'Novo status desejado. Deve respeitar a maquina de estados: ' +
      'Em analise -> Aprovado -> Em andamento -> Encerrado, ou qualquer ' +
      'status (exceto Encerrado/Cancelado) -> Cancelado.',
  })
  @IsEnum(ProjectStatus)
  status!: ProjectStatus;
}
