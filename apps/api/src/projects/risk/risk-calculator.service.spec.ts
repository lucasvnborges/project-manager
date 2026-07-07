import { ProjectRisk } from '@repo/shared-types';
import { RiskCalculatorService } from './risk-calculator.service';

describe('RiskCalculatorService', () => {
  let service: RiskCalculatorService;

  beforeEach(() => {
    service = new RiskCalculatorService();
  });

  function calculate(budget: number, months: number): ProjectRisk {
    const startDate = new Date('2026-01-01');
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);
    return service.calculate({ budget, startDate, endDate });
  }

  describe('regra de orcamento (com prazo curto e irrelevante)', () => {
    it('classifica como BAIXO ate R$ 100.000', () => {
      expect(calculate(100_000, 1)).toBe(ProjectRisk.BAIXO);
    });

    it('classifica como MEDIO a partir de R$ 100.001', () => {
      expect(calculate(100_001, 1)).toBe(ProjectRisk.MEDIO);
    });

    it('classifica como MEDIO no limite superior de R$ 500.000', () => {
      expect(calculate(500_000, 1)).toBe(ProjectRisk.MEDIO);
    });

    it('classifica como ALTO acima de R$ 500.000', () => {
      expect(calculate(500_001, 1)).toBe(ProjectRisk.ALTO);
    });
  });

  describe('regra de prazo (com orcamento baixo e irrelevante)', () => {
    it('classifica como BAIXO com prazo de exatamente 3 meses', () => {
      expect(calculate(1_000, 3)).toBe(ProjectRisk.BAIXO);
    });

    it('classifica como MEDIO com prazo de 4 meses', () => {
      expect(calculate(1_000, 4)).toBe(ProjectRisk.MEDIO);
    });

    it('classifica como MEDIO no limite superior de 6 meses', () => {
      expect(calculate(1_000, 6)).toBe(ProjectRisk.MEDIO);
    });

    it('classifica como ALTO com prazo superior a 6 meses', () => {
      expect(calculate(1_000, 7)).toBe(ProjectRisk.ALTO);
    });
  });

  describe('prevalencia do maior risco quando as regras discordam', () => {
    it('prazo MEDIO eleva orcamento BAIXO para MEDIO', () => {
      expect(calculate(1_000, 4)).toBe(ProjectRisk.MEDIO);
    });

    it('prazo ALTO eleva orcamento BAIXO para ALTO', () => {
      expect(calculate(1_000, 8)).toBe(ProjectRisk.ALTO);
    });

    it('orcamento ALTO eleva prazo BAIXO para ALTO', () => {
      expect(calculate(600_000, 1)).toBe(ProjectRisk.ALTO);
    });

    it('orcamento MEDIO e prazo ALTO resultam em ALTO', () => {
      expect(calculate(200_000, 8)).toBe(ProjectRisk.ALTO);
    });

    it('orcamento ALTO e prazo MEDIO resultam em ALTO', () => {
      expect(calculate(600_000, 4)).toBe(ProjectRisk.ALTO);
    });
  });
});
