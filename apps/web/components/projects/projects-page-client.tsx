'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { Project } from '@repo/shared-types';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/hooks/use-projects';
import { DeleteProjectDialog } from './delete-project-dialog';
import { ProjectFormModal } from './project-form-modal';
import { ProjectsEmptyState } from './projects-empty-state';
import { ProjectsErrorState } from './projects-error-state';
import { ProjectsLoadingState } from './projects-loading-state';
import { ProjectsTable } from './projects-table';

interface FormModalState {
  open: boolean;
  project?: Project;
}

export function ProjectsPageClient(): React.JSX.Element {
  const { data: projects, isLoading, isError, refetch } = useProjects();
  const [formState, setFormState] = useState<FormModalState>({ open: false });
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const openCreateForm = (): void => setFormState({ open: true, project: undefined });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Projetos
          </h1>
          <p className="text-sm text-ink-muted">
            Gerencie o cadastro, status e risco dos projetos da empresa.
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4" />
          Novo projeto
        </Button>
      </div>

      {isLoading && <ProjectsLoadingState />}

      {isError && !isLoading && (
        <ProjectsErrorState onRetry={() => void refetch()} />
      )}

      {!isLoading && !isError && projects && projects.length === 0 && (
        <ProjectsEmptyState onCreate={openCreateForm} />
      )}

      {!isLoading && !isError && projects && projects.length > 0 && (
        <ProjectsTable
          projects={projects}
          onEdit={(project) => setFormState({ open: true, project })}
          onDelete={setProjectToDelete}
        />
      )}

      <ProjectFormModal
        open={formState.open}
        project={formState.project}
        onOpenChange={(open) =>
          setFormState((state) => ({ ...state, open }))
        }
      />

      <DeleteProjectDialog
        project={projectToDelete}
        onOpenChange={(open) => {
          if (!open) setProjectToDelete(null);
        }}
      />
    </div>
  );
}
