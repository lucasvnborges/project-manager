export enum ProjectRisk {
  BAIXO = 'BAIXO',
  MEDIO = 'MEDIO',
  ALTO = 'ALTO',
}

export const PROJECT_RISK_LABELS: Record<ProjectRisk, string> = {
  [ProjectRisk.BAIXO]: 'Baixo',
  [ProjectRisk.MEDIO]: 'Médio',
  [ProjectRisk.ALTO]: 'Alto',
};

/** Ordem crescente de severidade, usada para calcular o "maior risco". */
export const PROJECT_RISK_ORDER: Record<ProjectRisk, number> = {
  [ProjectRisk.BAIXO]: 0,
  [ProjectRisk.MEDIO]: 1,
  [ProjectRisk.ALTO]: 2,
};
