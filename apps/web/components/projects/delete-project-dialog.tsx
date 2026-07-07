'use client';

import { toast } from 'sonner';
import type { Project } from '@repo/shared-types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteProject } from '@/hooks/use-project-mutations';
import { ApiError } from '@/lib/api-client';

interface DeleteProjectDialogProps {
  project: Project | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteProjectDialog({
  project,
  onOpenChange,
}: DeleteProjectDialogProps): React.JSX.Element {
  const deleteProject = useDeleteProject();

  const handleConfirm = (): void => {
    if (!project) return;

    deleteProject.mutate(project.id, {
      onSuccess: () => {
        toast.success('Projeto removido com sucesso.');
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(
          error instanceof ApiError
            ? error.message
            : 'Nao foi possivel remover o projeto.',
        );
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={Boolean(project)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remover projeto</DialogTitle>
          <DialogDescription>
            {`Tem certeza que deseja remover ${
              project ? `"${project.name}"` : 'este projeto'
            }? Essa acao nao pode ser desfeita.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleteProject.isPending}
          >
            {deleteProject.isPending ? 'Removendo...' : 'Remover'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
