export enum ProjectStatus {
  EM_ANALISE = 'EM_ANALISE',
  APROVADO = 'APROVADO',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  ENCERRADO = 'ENCERRADO',
  CANCELADO = 'CANCELADO',
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.EM_ANALISE]: 'Em análise',
  [ProjectStatus.APROVADO]: 'Aprovado',
  [ProjectStatus.EM_ANDAMENTO]: 'Em andamento',
  [ProjectStatus.ENCERRADO]: 'Encerrado',
  [ProjectStatus.CANCELADO]: 'Cancelado',
};

/**
 * Fonte única de verdade para a máquina de estados de status.
 * Reutilizada pelo backend (validação) e pelo frontend (habilitar/desabilitar ações).
 */
export const PROJECT_STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  [ProjectStatus.EM_ANALISE]: [ProjectStatus.APROVADO, ProjectStatus.CANCELADO],
  [ProjectStatus.APROVADO]: [ProjectStatus.EM_ANDAMENTO, ProjectStatus.CANCELADO],
  [ProjectStatus.EM_ANDAMENTO]: [ProjectStatus.ENCERRADO, ProjectStatus.CANCELADO],
  [ProjectStatus.ENCERRADO]: [],
  [ProjectStatus.CANCELADO]: [],
};

export const PROJECT_STATUSES_BLOCKING_DELETION: ProjectStatus[] = [
  ProjectStatus.EM_ANDAMENTO,
  ProjectStatus.ENCERRADO,
];

export function isStatusTransitionAllowed(
  from: ProjectStatus,
  to: ProjectStatus,
): boolean {
  return PROJECT_STATUS_TRANSITIONS[from].includes(to);
}
