import { ProjectStatus } from '@repo/shared-types';
import { InvalidStatusTransitionException } from '../exceptions/invalid-status-transition.exception';
import { StatusTransitionValidator } from './status-transition.validator';

describe('StatusTransitionValidator', () => {
  let validator: StatusTransitionValidator;

  beforeEach(() => {
    validator = new StatusTransitionValidator();
  });

  const ALL_STATUSES = Object.values(ProjectStatus);

  /** Matriz de transicoes permitidas, definida explicitamente a partir da regra de negocio. */
  const ALLOWED_TRANSITIONS: Array<[ProjectStatus, ProjectStatus]> = [
    [ProjectStatus.EM_ANALISE, ProjectStatus.APROVADO],
    [ProjectStatus.EM_ANALISE, ProjectStatus.CANCELADO],
    [ProjectStatus.APROVADO, ProjectStatus.EM_ANDAMENTO],
    [ProjectStatus.APROVADO, ProjectStatus.CANCELADO],
    [ProjectStatus.EM_ANDAMENTO, ProjectStatus.ENCERRADO],
    [ProjectStatus.EM_ANDAMENTO, ProjectStatus.CANCELADO],
  ];

  function isAllowed(from: ProjectStatus, to: ProjectStatus): boolean {
    return ALLOWED_TRANSITIONS.some(([f, t]) => f === from && t === to);
  }

  describe.each(ALL_STATUSES)('a partir de %s', (from) => {
    it.each(ALL_STATUSES)('transicao para %s', (to) => {
      if (isAllowed(from, to)) {
        expect(() =>
          validator.assertTransitionIsAllowed(from, to),
        ).not.toThrow();
      } else {
        expect(() => validator.assertTransitionIsAllowed(from, to)).toThrow(
          InvalidStatusTransitionException,
        );
      }
    });
  });

  it('nao permite pular etapas (Em analise -> Em andamento)', () => {
    expect(() =>
      validator.assertTransitionIsAllowed(
        ProjectStatus.EM_ANALISE,
        ProjectStatus.EM_ANDAMENTO,
      ),
    ).toThrow(InvalidStatusTransitionException);
  });

  it('permite cancelar a partir de Aprovado', () => {
    expect(() =>
      validator.assertTransitionIsAllowed(
        ProjectStatus.APROVADO,
        ProjectStatus.CANCELADO,
      ),
    ).not.toThrow();
  });

  it('permite cancelar a partir de Em andamento', () => {
    expect(() =>
      validator.assertTransitionIsAllowed(
        ProjectStatus.EM_ANDAMENTO,
        ProjectStatus.CANCELADO,
      ),
    ).not.toThrow();
  });

  it('nao permite nenhuma transicao a partir de Encerrado (estado terminal)', () => {
    for (const to of ALL_STATUSES) {
      expect(() =>
        validator.assertTransitionIsAllowed(ProjectStatus.ENCERRADO, to),
      ).toThrow(InvalidStatusTransitionException);
    }
  });

  it('nao permite nenhuma transicao a partir de Cancelado (estado terminal)', () => {
    for (const to of ALL_STATUSES) {
      expect(() =>
        validator.assertTransitionIsAllowed(ProjectStatus.CANCELADO, to),
      ).toThrow(InvalidStatusTransitionException);
    }
  });
});
