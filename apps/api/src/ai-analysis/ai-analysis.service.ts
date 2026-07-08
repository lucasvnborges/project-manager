import { Inject, Injectable, Logger } from '@nestjs/common';
import { Project, ProjectAiAnalysis } from '@repo/shared-types';
import { AI_CLIENT, type AiClient } from './ai-client.interface';
import { ProjectAnalysisPromptBuilder } from './project-analysis-prompt.builder';
import { extractJsonObject } from './utils/extract-json';

interface RawAiAnalysisPayload {
  summary?: unknown;
  attentionPoints?: unknown;
  executiveRecommendation?: unknown;
}

/**
 * Orquestra a geracao da analise de um projeto: monta o prompt
 * (ProjectAnalysisPromptBuilder), delega a geracao de texto ao
 * AiClient configurado (real ou mock) e normaliza o retorno para o
 * contrato ProjectAiAnalysis, mesmo que o modelo nao siga o formato
 * pedido a risca. Nunca deve ser chamado diretamente pelo controller.
 */
@Injectable()
export class AiAnalysisService {
  private readonly logger = new Logger(AiAnalysisService.name);

  constructor(
    @Inject(AI_CLIENT) private readonly aiClient: AiClient,
    private readonly promptBuilder: ProjectAnalysisPromptBuilder,
  ) {}

  async analyze(project: Project): Promise<ProjectAiAnalysis> {
    const prompt = this.promptBuilder.build(project);
    const rawResponse = await this.aiClient.complete(prompt);
    return this.parseResponse(rawResponse, project);
  }

  private parseResponse(raw: string, project: Project): ProjectAiAnalysis {
    try {
      const parsed = JSON.parse(extractJsonObject(raw)) as RawAiAnalysisPayload;

      return {
        summary: this.asNonEmptyString(
          parsed.summary,
          this.fallbackSummary(project),
        ),
        attentionPoints: this.asStringArray(parsed.attentionPoints),
        executiveRecommendation: this.asNonEmptyString(
          parsed.executiveRecommendation,
          this.fallbackRecommendation(),
        ),
        generatedAt: new Date().toISOString(),
      };
    } catch {
      this.logger.warn(
        'Não foi possível interpretar a resposta da IA como JSON; usando fallback textual.',
      );
      return {
        summary: raw.trim().slice(0, 600) || this.fallbackSummary(project),
        attentionPoints: [],
        executiveRecommendation: this.fallbackRecommendation(),
        generatedAt: new Date().toISOString(),
      };
    }
  }

  private asNonEmptyString(value: unknown, fallback: string): string {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
    return fallback;
  }

  private asStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  private fallbackSummary(project: Project): string {
    return `Não foi possível gerar automaticamente um resumo estruturado para "${project.name}".`;
  }

  private fallbackRecommendation(): string {
    return 'Revisão manual recomendada antes de tomar decisões com base nesta análise.';
  }
}
