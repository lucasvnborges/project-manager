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
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  @IsAfter('startDate', {
    message: 'endDate (previsao de termino) deve ser posterior a startDate',
  })
  endDate!: string;

  @IsNumber()
  @Min(0)
  budget!: number;

  @IsString()
  @IsNotEmpty()
  description!: string;
}
