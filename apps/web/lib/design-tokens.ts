import { ProjectRisk, ProjectStatus } from '@repo/shared-types';

/**
 * Mapeia cada status/risco para as classes utilitarias do design
 * system (tokens definidos em app/globals.css#@theme). Centralizar
 * esse mapeamento evita espalhar decisoes visuais pelos componentes.
 */
export const STATUS_BADGE_CLASSES: Record<ProjectStatus, string> = {
  [ProjectStatus.EM_ANALISE]:
    'bg-status-analise-surface text-status-analise-content',
  [ProjectStatus.APROVADO]:
    'bg-status-aprovado-surface text-status-aprovado-content',
  [ProjectStatus.EM_ANDAMENTO]:
    'bg-status-andamento-surface text-status-andamento-content',
  [ProjectStatus.ENCERRADO]:
    'bg-status-encerrado-surface text-status-encerrado-content',
  [ProjectStatus.CANCELADO]:
    'bg-status-cancelado-surface text-status-cancelado-content',
};

export const RISK_BADGE_CLASSES: Record<ProjectRisk, string> = {
  [ProjectRisk.BAIXO]: 'bg-risk-baixo-surface text-risk-baixo-content',
  [ProjectRisk.MEDIO]: 'bg-risk-medio-surface text-risk-medio-content',
  [ProjectRisk.ALTO]: 'bg-risk-alto-surface text-risk-alto-content',
};
