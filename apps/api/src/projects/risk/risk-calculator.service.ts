import { Injectable } from '@nestjs/common';
import { differenceInMonths } from 'date-fns';
import { PROJECT_RISK_ORDER, ProjectRisk } from '@repo/shared-types';

export interface RiskCalculationInput {
  budget: number;
  startDate: Date;
  endDate: Date;
}

const BUDGET_LOW_MAX = 100_000;
const BUDGET_MEDIUM_MAX = 500_000;
const DURATION_LOW_MAX_MONTHS = 3;
const DURATION_MEDIUM_MAX_MONTHS = 6;

/**
 * Calcula a classificacao de risco de um projeto a partir do orcamento e
 * do prazo (diferenca entre data de inicio e previsao de termino).
 *
 * Regras (ver README para o detalhamento completo):
 * - Orcamento: <= 100.000 baixo | 100.001-500.000 medio | > 500.000 alto.
 * - Prazo: <= 3 meses baixo | > 3 e <= 6 meses medio | > 6 meses alto.
 * - Quando as duas regras discordam, prevalece o maior risco.
 *
 * A duracao em meses e calculada com `date-fns#differenceInMonths`, que
 * considera meses cheios de calendario (ex.: 01/01 -> 01/04 = 3 meses).
 */
@Injectable()
export class RiskCalculatorService {
  calculate({ budget, startDate, endDate }: RiskCalculationInput): ProjectRisk {
    const budgetRisk = this.calculateBudgetRisk(budget);
    const durationRisk = this.calculateDurationRisk(startDate, endDate);
    return this.highestRisk(budgetRisk, durationRisk);
  }

  private calculateBudgetRisk(budget: number): ProjectRisk {
    if (budget > BUDGET_MEDIUM_MAX) return ProjectRisk.ALTO;
    if (budget > BUDGET_LOW_MAX) return ProjectRisk.MEDIO;
    return ProjectRisk.BAIXO;
  }

  private calculateDurationRisk(startDate: Date, endDate: Date): ProjectRisk {
    const durationInMonths = differenceInMonths(endDate, startDate);
    if (durationInMonths > DURATION_MEDIUM_MAX_MONTHS) return ProjectRisk.ALTO;
    if (durationInMonths > DURATION_LOW_MAX_MONTHS) return ProjectRisk.MEDIO;
    return ProjectRisk.BAIXO;
  }

  private highestRisk(a: ProjectRisk, b: ProjectRisk): ProjectRisk {
    return PROJECT_RISK_ORDER[a] >= PROJECT_RISK_ORDER[b] ? a : b;
  }
}
