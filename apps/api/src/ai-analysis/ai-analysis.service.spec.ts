import { Project, ProjectRisk, ProjectStatus } from '@repo/shared-types';
import { AiAnalysisService } from './ai-analysis.service';
import { ProjectAnalysisPromptBuilder } from './project-analysis-prompt.builder';

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

describe('AiAnalysisService', () => {
  let aiClient: { complete: jest.Mock };
  let service: AiAnalysisService;

  beforeEach(() => {
    aiClient = { complete: jest.fn() };
    service = new AiAnalysisService(
      aiClient,
      new ProjectAnalysisPromptBuilder(),
    );
  });

  it('constroi o prompt a partir do projeto e delega ao AiClient', async () => {
    aiClient.complete.mockResolvedValue(
      JSON.stringify({
        summary: 'Resumo',
        attentionPoints: ['Ponto 1'],
        executiveRecommendation: 'Recomendacao',
      }),
    );

    await service.analyze(buildProject({ name: 'Projeto XPTO' }));

    expect(aiClient.complete).toHaveBeenCalledTimes(1);
    expect(aiClient.complete).toHaveBeenCalledWith(
      expect.stringContaining('Projeto XPTO'),
    );
  });

  it('normaliza uma resposta JSON valida do AiClient', async () => {
    aiClient.complete.mockResolvedValue(
      JSON.stringify({
        summary: 'Projeto dentro do prazo e do orcamento previstos.',
        attentionPoints: ['Escopo pode crescer', 'Dependencia externa critica'],
        executiveRecommendation: 'Manter acompanhamento quinzenal.',
      }),
    );

    const result = await service.analyze(buildProject());

    expect(result).toMatchObject({
      summary: 'Projeto dentro do prazo e do orcamento previstos.',
      attentionPoints: ['Escopo pode crescer', 'Dependencia externa critica'],
      executiveRecommendation: 'Manter acompanhamento quinzenal.',
    });
    expect(result.generatedAt).toBeDefined();
  });

  it('extrai o JSON mesmo quando envolvido em bloco markdown', async () => {
    aiClient.complete.mockResolvedValue(
      '```json\n' +
        JSON.stringify({
          summary: 'Resumo entre crases',
          attentionPoints: [],
          executiveRecommendation: 'Recomendacao entre crases',
        }) +
        '\n```',
    );

    const result = await service.analyze(buildProject());

    expect(result.summary).toBe('Resumo entre crases');
    expect(result.executiveRecommendation).toBe('Recomendacao entre crases');
  });

  it('usa um fallback textual quando a resposta nao e um JSON valido', async () => {
    aiClient.complete.mockResolvedValue(
      'desculpe, nao consigo ajudar com isso.',
    );

    const result = await service.analyze(buildProject({ name: 'Projeto Y' }));

    expect(result.summary).toContain('desculpe');
    expect(result.attentionPoints).toEqual([]);
    expect(result.executiveRecommendation).toContain('Revisão manual');
  });

  it('ignora campos com tipos inesperados e aplica fallback apenas neles', async () => {
    aiClient.complete.mockResolvedValue(
      JSON.stringify({
        summary: 123,
        attentionPoints: 'nao deveria ser string',
        executiveRecommendation: '',
      }),
    );

    const result = await service.analyze(buildProject({ name: 'Projeto Z' }));

    expect(result.summary).toContain('Projeto Z');
    expect(result.attentionPoints).toEqual([]);
    expect(result.executiveRecommendation).toContain('Revisão manual');
  });
});
