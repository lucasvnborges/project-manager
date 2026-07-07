import { Test, TestingModule } from '@nestjs/testing';
import { Project, ProjectRisk, ProjectStatus } from '@repo/shared-types';
import { InvalidDateRangeException } from './exceptions/invalid-date-range.exception';
import { InvalidStatusTransitionException } from './exceptions/invalid-status-transition.exception';
import { ProjectDeletionNotAllowedException } from './exceptions/project-deletion-not-allowed.exception';
import { ProjectNotFoundException } from './exceptions/project-not-found.exception';
import { ProjectsRepository } from './projects.repository';
import { ProjectsService } from './projects.service';
import { RiskCalculatorService } from './risk/risk-calculator.service';
import { StatusTransitionValidator } from './status/status-transition.validator';

function buildProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'project-1',
    name: 'Projeto exemplo',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2026-02-01T00:00:00.000Z',
    budget: 50_000,
    description: 'Descricao do projeto',
    status: ProjectStatus.EM_ANALISE,
    risk: ProjectRisk.BAIXO,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('ProjectsService', () => {
  let service: ProjectsService;
  let repository: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        RiskCalculatorService,
        StatusTransitionValidator,
        { provide: ProjectsRepository, useValue: repository },
      ],
    }).compile();

    service = module.get(ProjectsService);
  });

  describe('create', () => {
    it('cria o projeto sempre com status EM_ANALISE e risco calculado', async () => {
      repository.create.mockResolvedValue(buildProject());

      await service.create({
        name: 'Projeto exemplo',
        startDate: '2026-01-01',
        endDate: '2026-02-01',
        budget: 50_000,
        description: 'Descricao do projeto',
      });

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ProjectStatus.EM_ANALISE,
          risk: ProjectRisk.BAIXO,
        }),
      );
    });

    it('lanca InvalidDateRangeException quando a previsao de termino nao e posterior ao inicio', async () => {
      await expect(
        service.create({
          name: 'Projeto invalido',
          startDate: '2026-02-01',
          endDate: '2026-01-01',
          budget: 10_000,
          description: 'Descricao',
        }),
      ).rejects.toThrow(InvalidDateRangeException);

      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('lanca ProjectNotFoundException quando o projeto nao existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('inexistente')).rejects.toThrow(
        ProjectNotFoundException,
      );
    });
  });

  describe('update', () => {
    it('recalcula o risco quando o orcamento e alterado', async () => {
      repository.findById.mockResolvedValue(
        buildProject({ budget: 50_000, risk: ProjectRisk.BAIXO }),
      );
      repository.update.mockResolvedValue(buildProject({ budget: 600_000 }));

      await service.update('project-1', { budget: 600_000 });

      expect(repository.update).toHaveBeenCalledWith(
        'project-1',
        expect.objectContaining({ risk: ProjectRisk.ALTO }),
      );
    });

    it('mantem o risco existente quando so campos descritivos sao alterados', async () => {
      repository.findById.mockResolvedValue(
        buildProject({ risk: ProjectRisk.MEDIO }),
      );
      repository.update.mockResolvedValue(buildProject());

      await service.update('project-1', { name: 'Novo nome' });

      expect(repository.update).toHaveBeenCalledWith(
        'project-1',
        expect.objectContaining({ risk: ProjectRisk.MEDIO }),
      );
    });
  });

  describe('remove', () => {
    it.each([ProjectStatus.EM_ANDAMENTO, ProjectStatus.ENCERRADO])(
      'bloqueia a remocao de projetos com status %s',
      async (status) => {
        repository.findById.mockResolvedValue(buildProject({ status }));

        await expect(service.remove('project-1')).rejects.toThrow(
          ProjectDeletionNotAllowedException,
        );
        expect(repository.delete).not.toHaveBeenCalled();
      },
    );

    it.each([
      ProjectStatus.EM_ANALISE,
      ProjectStatus.APROVADO,
      ProjectStatus.CANCELADO,
    ])('permite a remocao de projetos com status %s', async (status) => {
      repository.findById.mockResolvedValue(buildProject({ status }));

      await service.remove('project-1');

      expect(repository.delete).toHaveBeenCalledWith('project-1');
    });
  });

  describe('changeStatus', () => {
    it('atualiza o status quando a transicao e permitida', async () => {
      repository.findById.mockResolvedValue(
        buildProject({ status: ProjectStatus.EM_ANALISE }),
      );
      repository.update.mockResolvedValue(
        buildProject({ status: ProjectStatus.APROVADO }),
      );

      await service.changeStatus('project-1', {
        status: ProjectStatus.APROVADO,
      });

      expect(repository.update).toHaveBeenCalledWith('project-1', {
        status: ProjectStatus.APROVADO,
      });
    });

    it('lanca InvalidStatusTransitionException quando a transicao pula etapas', async () => {
      repository.findById.mockResolvedValue(
        buildProject({ status: ProjectStatus.EM_ANALISE }),
      );

      await expect(
        service.changeStatus('project-1', {
          status: ProjectStatus.EM_ANDAMENTO,
        }),
      ).rejects.toThrow(InvalidStatusTransitionException);

      expect(repository.update).not.toHaveBeenCalled();
    });
  });
});
