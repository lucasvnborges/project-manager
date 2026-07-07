import { Injectable } from '@nestjs/common';
import type { Project as PrismaProject } from '@prisma/client';
import { Project, ProjectRisk, ProjectStatus } from '@repo/shared-types';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateProjectData {
  name: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  description: string;
  status: ProjectStatus;
  risk: ProjectRisk;
}

export type UpdateProjectData = Partial<CreateProjectData>;

/**
 * Camada de acesso a dados do Project. Traduz entre o formato de
 * persistencia do Prisma (status/risk armazenados como String) e o
 * contrato de dominio compartilhado (@repo/shared-types#Project),
 * mantendo o restante da aplicacao desacoplado do Prisma.
 */
@Injectable()
export class ProjectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProjectData): Promise<Project> {
    const created = await this.prisma.project.create({ data });
    return this.toDomain(created);
  }

  async findAll(): Promise<Project[]> {
    const rows = await this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<Project | null> {
    const row = await this.prisma.project.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async update(id: string, data: UpdateProjectData): Promise<Project> {
    const updated = await this.prisma.project.update({ where: { id }, data });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({ where: { id } });
  }

  private toDomain(row: PrismaProject): Project {
    return {
      id: row.id,
      name: row.name,
      startDate: row.startDate.toISOString(),
      endDate: row.endDate.toISOString(),
      budget: row.budget,
      description: row.description,
      status: row.status as ProjectStatus,
      risk: row.risk as ProjectRisk,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
