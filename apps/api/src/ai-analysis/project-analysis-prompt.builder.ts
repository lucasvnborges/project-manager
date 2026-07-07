import { Injectable } from '@nestjs/common';
import {
  PROJECT_RISK_LABELS,
  PROJECT_STATUS_LABELS,
  Project,
} from '@repo/shared-types';

/**
 * Monta o prompt enviado ao provedor de IA a partir dos dados de um
 * projeto, pedindo explicitamente uma resposta em JSON com os 3 campos
 * exigidos pelo desafio (resumo, pontos de atencao e recomendacao
 * executiva). Manter essa logica isolada permite ajustar o prompt sem
 * tocar em AiAnalysisService ou no AiClient.
 */
@Injectable()
export class ProjectAnalysisPromptBuilder {
  build(project: Project): string {
    const budgetFormatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(project.budget);

    return [
      'Voce e um assistente de gestao de projetos que produz analises executivas curtas, claras e objetivas em portugues do Brasil.',
      '',
      'Dados do projeto:',
      `- Nome: ${project.name}`,
      `- Status atual: ${PROJECT_STATUS_LABELS[project.status]}`,
      `- Risco calculado: ${PROJECT_RISK_LABELS[project.risk]}`,
      `- Orcamento total: ${budgetFormatted}`,
      `- Data de inicio: ${this.formatDate(project.startDate)}`,
      `- Previsao de termino: ${this.formatDate(project.endDate)}`,
      `- Descricao: ${project.description}`,
      '',
      'Gere uma analise executiva respondendo SOMENTE com um objeto JSON valido, sem markdown e sem texto fora do JSON, com exatamente este formato:',
      '{',
      '  "summary": "resumo objetivo do projeto em 2-3 frases",',
      '  "attentionPoints": ["ponto de atencao 1", "ponto de atencao 2"],',
      '  "executiveRecommendation": "recomendacao executiva objetiva em 1-2 frases"',
      '}',
    ].join('\n');
  }

  private formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString('pt-BR');
  }
}
