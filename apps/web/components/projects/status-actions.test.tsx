import { screen } from '@testing-library/react';
import { ProjectRisk, ProjectStatus, type Project } from '@repo/shared-types';
import { describe, expect, it } from 'vitest';
import { renderWithQueryClient } from '../../test/test-utils';
import { StatusActions } from './status-actions';

function buildProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'project-1',
    name: 'Projeto exemplo',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2026-02-01T00:00:00.000Z',
    budget: 1000,
    description: 'Descricao',
    status: ProjectStatus.EM_ANALISE,
    risk: ProjectRisk.BAIXO,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('StatusActions', () => {
  it('exibe "Avançar para Aprovado" e "Cancelar projeto" quando o status é Em análise', () => {
    renderWithQueryClient(
      <StatusActions project={buildProject({ status: ProjectStatus.EM_ANALISE })} />,
    );

    expect(
      screen.getByRole('button', { name: /avançar para aprovado/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /cancelar projeto/i }),
    ).toBeInTheDocument();
  });

  it('exibe apenas "Avançar para Encerrado" (sem opção de retroceder) quando o status é Em andamento', () => {
    renderWithQueryClient(
      <StatusActions project={buildProject({ status: ProjectStatus.EM_ANDAMENTO })} />,
    );

    expect(
      screen.getByRole('button', { name: /avançar para encerrado/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /cancelar projeto/i }),
    ).toBeInTheDocument();
  });

  it('não exibe nenhuma ação quando o status é final (Encerrado)', () => {
    renderWithQueryClient(
      <StatusActions project={buildProject({ status: ProjectStatus.ENCERRADO })} />,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText(/status final/i)).toBeInTheDocument();
  });

  it('não exibe nenhuma ação quando o status é final (Cancelado)', () => {
    renderWithQueryClient(
      <StatusActions project={buildProject({ status: ProjectStatus.CANCELADO })} />,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
