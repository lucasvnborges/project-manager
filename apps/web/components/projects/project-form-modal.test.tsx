import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../test/msw/server';
import { renderWithQueryClient } from '../../test/test-utils';
import { ProjectFormModal } from './project-form-modal';

const API_URL = 'http://localhost:3001';

describe('ProjectFormModal', () => {
  it('exibe erros de validacao ao submeter o formulario vazio', async () => {
    renderWithQueryClient(
      <ProjectFormModal open onOpenChange={() => {}} />,
    );

    await userEvent.click(screen.getByRole('button', { name: /^salvar$/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/informe o nome do projeto/i),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText(/informe a data de inicio/i)).toBeInTheDocument();
    expect(
      screen.getByText(/informe a previsao de termino/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/informe uma descricao/i)).toBeInTheDocument();
  });

  it('exibe erro quando a previsao de termino nao e posterior a data de inicio', async () => {
    renderWithQueryClient(
      <ProjectFormModal open onOpenChange={() => {}} />,
    );

    await userEvent.type(screen.getByLabelText(/^nome$/i), 'Projeto teste');
    fireEvent.change(screen.getByLabelText(/data de inicio/i), {
      target: { value: '2026-05-01' },
    });
    fireEvent.change(screen.getByLabelText(/previsao de termino/i), {
      target: { value: '2026-01-01' },
    });
    await userEvent.type(screen.getByLabelText(/orcamento total/i), '1000');
    await userEvent.type(screen.getByLabelText(/^descricao$/i), 'Descricao');

    await userEvent.click(screen.getByRole('button', { name: /^salvar$/i }));

    await waitFor(() =>
      expect(
        screen.getByText(
          /previsao de termino deve ser posterior a data de inicio/i,
        ),
      ).toBeInTheDocument(),
    );
  });

  it('envia os dados e fecha o modal quando o formulario e valido', async () => {
    const onOpenChange = vi.fn();
    server.use(
      http.post(`${API_URL}/projects`, () =>
        HttpResponse.json(
          {
            id: 'novo-projeto',
            name: 'Projeto valido',
            startDate: '2026-01-01T00:00:00.000Z',
            endDate: '2026-03-01T00:00:00.000Z',
            budget: 1000,
            description: 'Descricao valida',
            status: 'EM_ANALISE',
            risk: 'BAIXO',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
          { status: 201 },
        ),
      ),
    );

    renderWithQueryClient(
      <ProjectFormModal open onOpenChange={onOpenChange} />,
    );

    await userEvent.type(screen.getByLabelText(/^nome$/i), 'Projeto valido');
    fireEvent.change(screen.getByLabelText(/data de inicio/i), {
      target: { value: '2026-01-01' },
    });
    fireEvent.change(screen.getByLabelText(/previsao de termino/i), {
      target: { value: '2026-03-01' },
    });
    await userEvent.type(screen.getByLabelText(/orcamento total/i), '1000');
    await userEvent.type(
      screen.getByLabelText(/^descricao$/i),
      'Descricao valida',
    );

    await userEvent.click(screen.getByRole('button', { name: /^salvar$/i }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });
});
