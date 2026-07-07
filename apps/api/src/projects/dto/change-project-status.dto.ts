import { IsEnum } from 'class-validator';
import { ProjectStatus } from '@repo/shared-types';

export class ChangeProjectStatusDto {
  @IsEnum(ProjectStatus)
  status!: ProjectStatus;
}
