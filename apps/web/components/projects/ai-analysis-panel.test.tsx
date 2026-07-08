import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../../test/msw/server';
import { renderWithQueryClient } from '../../test/test-utils';
import { AiAnalysisPanel } from './ai-analysis-panel';

const API_URL = 'http://localhost:3001';

describe('AiAnalysisPanel', () => {
  it('exibe resumo, pontos de atencao e recomendacao apos gerar a analise', async () => {
    server.use(
      http.get(`${API_URL}/projects/proj-1/ai-analysis`, () =>
        HttpResponse.json({
          summary: 'Resumo de teste',
          attentionPoints: ['Ponto de atencao 1'],
          executiveRecommendation: 'Recomendacao de teste',
          generatedAt: new Date().toISOString(),
        }),
      ),
    );

    renderWithQueryClient(<AiAnalysisPanel projectId="proj-1" />);

    await userEvent.click(
      screen.getByRole('button', { name: /gerar análise/i }),
    );

    await waitFor(() =>
      expect(screen.getByText('Resumo de teste')).toBeInTheDocument(),
    );
    expect(screen.getByText('Ponto de atencao 1')).toBeInTheDocument();
    expect(screen.getByText('Recomendacao de teste')).toBeInTheDocument();
  });

  it('exibe a mensagem de erro retornada pela api quando a analise falha', async () => {
    server.use(
      http.get(`${API_URL}/projects/proj-2/ai-analysis`, () =>
        HttpResponse.json(
          {
            statusCode: 404,
            error: 'Not Found',
            message: 'Projeto nao encontrado',
            timestamp: new Date().toISOString(),
            path: '/projects/proj-2/ai-analysis',
          },
          { status: 404 },
        ),
      ),
    );

    renderWithQueryClient(<AiAnalysisPanel projectId="proj-2" />);

    await userEvent.click(
      screen.getByRole('button', { name: /gerar análise/i }),
    );

    await waitFor(() =>
      expect(screen.getByText('Projeto nao encontrado')).toBeInTheDocument(),
    );
  });
});
