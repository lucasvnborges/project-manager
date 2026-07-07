import { ProjectRisk } from './project-risk';
import { ProjectStatus } from './project-status';

export interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  budget: number;
  description: string;
  status: ProjectStatus;
  risk: ProjectRisk;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  startDate: string;
  endDate: string;
  budget: number;
  description: string;
}

export type UpdateProjectInput = Partial<CreateProjectInput>;

export interface ChangeProjectStatusInput {
  status: ProjectStatus;
}
