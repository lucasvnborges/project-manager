import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ProjectsEmptyState({
  onCreate,
}: {
  onCreate: () => void;
}): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-surface p-12 text-center">
      <p className="text-sm text-ink-muted">
        Nenhum projeto cadastrado ainda.
      </p>
      <Button onClick={onCreate}>
        <Plus className="h-4 w-4" />
        Criar o primeiro projeto
      </Button>
    </div>
  );
}
