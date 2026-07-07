import { Injectable } from '@nestjs/common';
import {
  PROJECT_STATUSES_BLOCKING_DELETION,
  Project,
  ProjectStatus,
} from '@repo/shared-types';
import { ChangeProjectStatusDto } from './dto/change-project-status.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InvalidDateRangeException } from './exceptions/invalid-date-range.exception';
import { ProjectDeletionNotAllowedException } from './exceptions/project-deletion-not-allowed.exception';
import { ProjectNotFoundException } from './exceptions/project-not-found.exception';
import { ProjectsRepository } from './projects.repository';
import { RiskCalculatorService } from './risk/risk-calculator.service';
import { StatusTransitionValidator } from './status/status-transition.validator';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly riskCalculator: RiskCalculatorService,
    private readonly statusTransitionValidator: StatusTransitionValidator,
  ) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    this.assertDateRangeIsValid(startDate, endDate);

    const risk = this.riskCalculator.calculate({
      budget: dto.budget,
      startDate,
      endDate,
    });

    return this.projectsRepository.create({
      name: dto.name,
      startDate,
      endDate,
      budget: dto.budget,
      description: dto.description,
      status: ProjectStatus.EM_ANALISE,
      risk,
    });
  }

  async findAll(): Promise<Project[]> {
    return this.projectsRepository.findAll();
  }

  async findById(id: string): Promise<Project> {
    const project = await this.projectsRepository.findById(id);
    if (!project) {
      throw new ProjectNotFoundException(id);
    }
    return project;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    const existing = await this.findById(id);

    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : new Date(existing.startDate);
    const endDate = dto.endDate
      ? new Date(dto.endDate)
      : new Date(existing.endDate);
    this.assertDateRangeIsValid(startDate, endDate);

    const budget = dto.budget ?? existing.budget;

    const shouldRecalculateRisk =
      dto.budget !== undefined ||
      dto.startDate !== undefined ||
      dto.endDate !== undefined;

    const risk = shouldRecalculateRisk
      ? this.riskCalculator.calculate({ budget, startDate, endDate })
      : existing.risk;

    return this.projectsRepository.update(id, {
      name: dto.name ?? existing.name,
      description: dto.description ?? existing.description,
      startDate,
      endDate,
      budget,
      risk,
    });
  }

  async remove(id: string): Promise<void> {
    const project = await this.findById(id);
    if (PROJECT_STATUSES_BLOCKING_DELETION.includes(project.status)) {
      throw new ProjectDeletionNotAllowedException(project.status);
    }
    await this.projectsRepository.delete(id);
  }

  async changeStatus(
    id: string,
    dto: ChangeProjectStatusDto,
  ): Promise<Project> {
    const project = await this.findById(id);
    this.statusTransitionValidator.assertTransitionIsAllowed(
      project.status,
      dto.status,
    );
    return this.projectsRepository.update(id, { status: dto.status });
  }

  private assertDateRangeIsValid(startDate: Date, endDate: Date): void {
    if (endDate.getTime() <= startDate.getTime()) {
      throw new InvalidDateRangeException();
    }
  }
}
