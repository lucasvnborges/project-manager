import { Project, ProjectRisk, ProjectStatus } from '@repo/shared-types';
import { ProjectAnalysisPromptBuilder } from './project-analysis-prompt.builder';

describe('ProjectAnalysisPromptBuilder', () => {
  const builder = new ProjectAnalysisPromptBuilder();

  const project: Project = {
    id: 'project-1',
    name: 'Plataforma de pagamentos',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2026-08-01T00:00:00.000Z',
    budget: 750_000,
    description: 'Nova plataforma de pagamentos para o marketplace.',
    status: ProjectStatus.EM_ANDAMENTO,
    risk: ProjectRisk.ALTO,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('inclui os principais dados do projeto no prompt', () => {
    const prompt = builder.build(project);

    expect(prompt).toContain('Plataforma de pagamentos');
    expect(prompt).toContain('Em andamento');
    expect(prompt).toContain('Alto');
    expect(prompt).toContain(
      'Nova plataforma de pagamentos para o marketplace.',
    );
  });

  it('instrui explicitamente o formato de resposta em JSON com os 3 campos exigidos', () => {
    const prompt = builder.build(project);

    expect(prompt).toContain('"summary"');
    expect(prompt).toContain('"attentionPoints"');
    expect(prompt).toContain('"executiveRecommendation"');
  });
});
