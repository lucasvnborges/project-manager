'use client';

import { toast } from 'sonner';
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_TRANSITIONS,
  ProjectStatus,
  type Project,
} from '@repo/shared-types';
import { Button } from '@/components/ui/button';
import { useChangeProjectStatus } from '@/hooks/use-project-mutations';
import { ApiError } from '@/lib/api-client';

/**
 * Acoes de avancar/cancelar status, derivadas da mesma maquina de
 * estados usada no backend (PROJECT_STATUS_TRANSITIONS). Nunca permite
 * pular etapas: so exibe o proximo status valido e a opcao de cancelar
 * quando aplicavel para o status atual.
 */
export function StatusActions({
  project,
}: {
  project: Project;
}): React.JSX.Element {
  const changeStatus = useChangeProjectStatus(project.id);
  const allowedTransitions = PROJECT_STATUS_TRANSITIONS[project.status];
  const advanceTo = allowedTransitions.find(
    (status) => status !== ProjectStatus.CANCELADO,
  );
  const canCancel = allowedTransitions.includes(ProjectStatus.CANCELADO);

  const handleChange = (status: ProjectStatus): void => {
    changeStatus.mutate(
      { status },
      {
        onSuccess: () =>
          toast.success(
            `Status atualizado para "${PROJECT_STATUS_LABELS[status]}".`,
          ),
        onError: (error) =>
          toast.error(
            error instanceof ApiError
              ? error.message
              : 'Nao foi possivel atualizar o status.',
          ),
      },
    );
  };

  if (!advanceTo && !canCancel) {
    return (
      <p className="text-sm text-ink-muted">
        Este projeto esta em um status final; nenhuma transicao esta
        disponivel.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {advanceTo && (
        <Button
          onClick={() => handleChange(advanceTo)}
          disabled={changeStatus.isPending}
        >
          Avancar para {PROJECT_STATUS_LABELS[advanceTo]}
        </Button>
      )}
      {canCancel && (
        <Button
          variant="destructive"
          onClick={() => handleChange(ProjectStatus.CANCELADO)}
          disabled={changeStatus.isPending}
        >
          Cancelar projeto
        </Button>
      )}
    </div>
  );
}
