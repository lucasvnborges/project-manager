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
import { STATUS_ADVANCE_BUTTON_CLASSES } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

/**
 * Ações de avançar/cancelar status, derivadas da mesma máquina de
 * estados usada no backend (PROJECT_STATUS_TRANSITIONS). Nunca permite
 * pular etapas: só exibe o próximo status válido e a opção de cancelar
 * quando aplicável para o status atual.
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
              : 'Não foi possível atualizar o status.',
          ),
      },
    );
  };

  if (!advanceTo && !canCancel) {
    return (
      <p className="text-sm text-ink-muted">
        Este projeto está em um status final; nenhuma transição está
        disponível.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-start gap-2">
      {canCancel && (
        <Button
          variant="destructive"
          onClick={() => handleChange(ProjectStatus.CANCELADO)}
          disabled={changeStatus.isPending}
        >
          Cancelar projeto
        </Button>
      )}
      {advanceTo && (
        <Button
          variant="status"
          className={cn(STATUS_ADVANCE_BUTTON_CLASSES[advanceTo])}
          onClick={() => handleChange(advanceTo)}
          disabled={changeStatus.isPending}
        >
          Avançar para {PROJECT_STATUS_LABELS[advanceTo]}
        </Button>
      )}
    </div>
  );
}
