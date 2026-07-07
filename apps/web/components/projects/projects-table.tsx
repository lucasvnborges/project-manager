import Link from 'next/link';
import { Eye, Pencil, Sparkles, Trash2 } from 'lucide-react';
import {
  PROJECT_STATUSES_BLOCKING_DELETION,
  type Project,
} from '@repo/shared-types';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/format';
import { RiskBadge } from './risk-badge';
import { StatusBadge } from './status-badge';

interface ProjectsTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectsTable({
  projects,
  onEdit,
  onDelete,
}: ProjectsTableProps): React.JSX.Element {
  return (
    <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-subtle">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="bg-canvas text-xs uppercase tracking-wide text-ink-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Nome</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Risco</th>
            <th className="px-4 py-3 font-medium">Orcamento</th>
            <th className="px-4 py-3 font-medium">Inicio</th>
            <th className="px-4 py-3 font-medium">Termino previsto</th>
            <th className="px-4 py-3 text-right font-medium">Acoes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {projects.map((project) => {
            const deletionBlocked = PROJECT_STATUSES_BLOCKING_DELETION.includes(
              project.status,
            );

            return (
              <tr
                key={project.id}
                className="transition-colors hover:bg-canvas/60"
              >
                <td className="px-4 py-3 font-medium text-ink">
                  <Link
                    href={`/projects/${project.id}`}
                    className="hover:text-accent hover:underline"
                  >
                    {project.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={project.status} />
                </td>
                <td className="px-4 py-3">
                  <RiskBadge risk={project.risk} />
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {formatCurrency(project.budget)}
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {formatDate(project.startDate)}
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {formatDate(project.endDate)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link
                        href={`/projects/${project.id}`}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link
                        href={`/projects/${project.id}#ai-analysis`}
                        title="Solicitar analise com IA"
                      >
                        <Sparkles className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(project)}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(project)}
                      disabled={deletionBlocked}
                      title={
                        deletionBlocked
                          ? 'Projetos Em andamento ou Encerrado nao podem ser removidos'
                          : 'Remover'
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
