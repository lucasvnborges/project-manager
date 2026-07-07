import { ApiProperty } from '@nestjs/swagger';
import { Project, ProjectRisk, ProjectStatus } from '@repo/shared-types';

export class ProjectResponseDto implements Project {
  @ApiProperty({ example: '9b0a3655-3845-4f72-8514-c560c926edee' })
  id!: string;

  @ApiProperty({ example: 'Website institucional' })
  name!: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  startDate!: string;

  @ApiProperty({ example: '2026-04-01T00:00:00.000Z' })
  endDate!: string;

  @ApiProperty({ example: 80000 })
  budget!: number;

  @ApiProperty({ example: 'Reconstrucao do site institucional da empresa.' })
  description!: string;

  @ApiProperty({ enum: ProjectStatus, example: ProjectStatus.EM_ANALISE })
  status!: ProjectStatus;

  @ApiProperty({ enum: ProjectRisk, example: ProjectRisk.BAIXO })
  risk!: ProjectRisk;

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  updatedAt!: string;

  static fromDomain(project: Project): ProjectResponseDto {
    return Object.assign(new ProjectResponseDto(), project);
  }
}
