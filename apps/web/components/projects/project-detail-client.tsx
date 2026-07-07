'use client';

import { ArrowLeft, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProject } from '@/hooks/use-project';
import { formatCurrency, formatDate } from '@/lib/format';
import { AiAnalysisPanel } from './ai-analysis-panel';
import { ProjectFormModal } from './project-form-modal';
import { RiskBadge } from './risk-badge';
import { StatusActions } from './status-actions';
import { StatusBadge } from './status-badge';

export function ProjectDetailClient({
  projectId,
}: {
  projectId: string;
}): React.JSX.Element {
  const { data: project, isLoading, isError, refetch } = useProject(projectId);
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-surface p-10 text-center">
        <p className="text-sm text-ink-muted">
          Nao foi possivel carregar este projeto.
        </p>
        <Button variant="outline" onClick={() => void refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para projetos
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 rounded-card border border-line bg-surface p-6 shadow-subtle">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              {project.name}
            </h1>
            <StatusBadge status={project.status} />
            <RiskBadge risk={project.risk} />
          </div>
          <p className="max-w-2xl text-sm text-ink-muted">
            {project.description}
          </p>
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-ink-muted">Orcamento</dt>
              <dd className="font-medium text-ink">
                {formatCurrency(project.budget)}
              </dd>
            </div>
            <div>
              <dt className="text-ink-muted">Data de inicio</dt>
              <dd className="font-medium text-ink">
                {formatDate(project.startDate)}
              </dd>
            </div>
            <div>
              <dt className="text-ink-muted">Previsao de termino</dt>
              <dd className="font-medium text-ink">
                {formatDate(project.endDate)}
              </dd>
            </div>
            <div>
              <dt className="text-ink-muted">Criado em</dt>
              <dd className="font-medium text-ink">
                {formatDate(project.createdAt)}
              </dd>
            </div>
          </dl>
        </div>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
      </div>

      <div className="rounded-card border border-line bg-surface p-6 shadow-subtle">
        <h2 className="mb-3 text-base font-semibold text-ink">
          Status do projeto
        </h2>
        <StatusActions project={project} />
      </div>

      <AiAnalysisPanel projectId={project.id} />

      <ProjectFormModal
        open={editOpen}
        project={project}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}
