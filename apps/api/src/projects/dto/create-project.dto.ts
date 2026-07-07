import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { IsAfter } from './validators/is-after.validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Website institucional', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @ApiProperty({
    example: '2026-01-01',
    description: 'Data de inicio (ISO 8601)',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    example: '2026-04-01',
    description:
      'Previsao de termino (ISO 8601), deve ser posterior a startDate',
  })
  @IsDateString()
  @IsAfter('startDate', {
    message: 'endDate (previsao de termino) deve ser posterior a startDate',
  })
  endDate!: string;

  @ApiProperty({
    example: 80000,
    minimum: 0,
    description: 'Orcamento total em R$',
  })
  @IsNumber()
  @Min(0)
  budget!: number;

  @ApiProperty({ example: 'Reconstrucao do site institucional da empresa.' })
  @IsString()
  @IsNotEmpty()
  description!: string;
}
