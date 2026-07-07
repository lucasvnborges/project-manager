import { Project, ProjectRisk, ProjectStatus } from '@repo/shared-types';

export class ProjectResponseDto implements Project {
  id!: string;
  name!: string;
  startDate!: string;
  endDate!: string;
  budget!: number;
  description!: string;
  status!: ProjectStatus;
  risk!: ProjectRisk;
  createdAt!: string;
  updatedAt!: string;

  static fromDomain(project: Project): ProjectResponseDto {
    return Object.assign(new ProjectResponseDto(), project);
  }
}
