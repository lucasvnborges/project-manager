'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useCreateProject,
  useUpdateProject,
} from '@/hooks/use-project-mutations';
import { ApiError } from '@/lib/api-client';
import { toDateInputValue } from '@/lib/format';
import {
  emptyProjectFormValues,
  projectFormSchema,
  type ProjectFormValues,
} from '@/lib/validation/project-form-schema';
import { zodResolver } from '@/lib/validation/zod-resolver';

interface ProjectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
}

/**
 * Modal reutilizavel de criacao/edicao de projeto. O status inicial
 * (Em analise) e definido automaticamente pelo backend na criacao; o
 * formulario nunca expoe um campo de status.
 */
export function ProjectFormModal({
  open,
  onOpenChange,
  project,
}: ProjectFormModalProps): React.JSX.Element {
  const isEditMode = Boolean(project);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject(project?.id ?? '');
  const mutation = isEditMode ? updateProject : createProject;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: emptyProjectFormValues,
  });

  useEffect(() => {
    if (!open) return;

    reset(
      project
        ? {
            name: project.name,
            startDate: toDateInputValue(project.startDate),
            endDate: toDateInputValue(project.endDate),
            budget: project.budget,
            description: project.description,
          }
        : emptyProjectFormValues,
    );
  }, [open, project, reset]);

  const onSubmit = (values: ProjectFormValues): void => {
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success(
          isEditMode
            ? 'Projeto atualizado com sucesso.'
            : 'Projeto criado com sucesso.',
        );
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(
          error instanceof ApiError
            ? error.message
            : 'Nao foi possivel salvar o projeto.',
        );
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar projeto' : 'Novo projeto'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Atualize os dados do projeto. O risco e recalculado automaticamente.'
              : 'O status inicial sera definido automaticamente como "Em analise".'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Ex.: Website institucional"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-risk-alto-content">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startDate">Data de inicio</Label>
              <Input id="startDate" type="date" {...register('startDate')} />
              {errors.startDate && (
                <p className="text-xs text-risk-alto-content">
                  {errors.startDate.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="endDate">Previsao de termino</Label>
              <Input id="endDate" type="date" {...register('endDate')} />
              {errors.endDate && (
                <p className="text-xs text-risk-alto-content">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="budget">Orcamento total (R$)</Label>
            <Input
              id="budget"
              type="number"
              step="0.01"
              min={0}
              {...register('budget', { valueAsNumber: true })}
            />
            {errors.budget && (
              <p className="text-xs text-risk-alto-content">
                {errors.budget.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descricao</Label>
            <Textarea id="description" rows={4} {...register('description')} />
            {errors.description && (
              <p className="text-xs text-risk-alto-content">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
