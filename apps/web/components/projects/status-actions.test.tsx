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
  it('exibe "Avancar para Aprovado" e "Cancelar projeto" quando o status e Em analise', () => {
    renderWithQueryClient(
      <StatusActions project={buildProject({ status: ProjectStatus.EM_ANALISE })} />,
    );

    expect(
      screen.getByRole('button', { name: /avancar para aprovado/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /cancelar projeto/i }),
    ).toBeInTheDocument();
  });

  it('exibe apenas "Avancar para Encerrado" (sem opcao de retroceder) quando o status e Em andamento', () => {
    renderWithQueryClient(
      <StatusActions project={buildProject({ status: ProjectStatus.EM_ANDAMENTO })} />,
    );

    expect(
      screen.getByRole('button', { name: /avancar para encerrado/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /cancelar projeto/i }),
    ).toBeInTheDocument();
  });

  it('nao exibe nenhuma acao quando o status e final (Encerrado)', () => {
    renderWithQueryClient(
      <StatusActions project={buildProject({ status: ProjectStatus.ENCERRADO })} />,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText(/status final/i)).toBeInTheDocument();
  });

  it('nao exibe nenhuma acao quando o status e final (Cancelado)', () => {
    renderWithQueryClient(
      <StatusActions project={buildProject({ status: ProjectStatus.CANCELADO })} />,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
