import { PROJECT_STATUS_LABELS, ProjectStatus } from '@repo/shared-types';
import { Badge } from '@/components/ui/badge';
import { STATUS_BADGE_CLASSES } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

export function StatusBadge({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}): React.JSX.Element {
  return (
    <Badge className={cn(STATUS_BADGE_CLASSES[status], className)}>
      {PROJECT_STATUS_LABELS[status]}
    </Badge>
  );
}
