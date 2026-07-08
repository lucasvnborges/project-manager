import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ProjectsErrorState({
  onRetry,
}: {
  onRetry: () => void;
}): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-surface p-12 text-center">
      <p className="text-sm text-ink-muted">
        Não foi possível carregar os projetos. Verifique sua conexão e tente
        novamente.
      </p>
      <Button variant="outline" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" />
        Tentar novamente
      </Button>
    </div>
  );
}
