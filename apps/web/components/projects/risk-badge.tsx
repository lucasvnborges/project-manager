import { PROJECT_RISK_LABELS, ProjectRisk } from '@repo/shared-types';
import { Badge } from '@/components/ui/badge';
import { RISK_BADGE_CLASSES } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

export function RiskBadge({
  risk,
  className,
}: {
  risk: ProjectRisk;
  className?: string;
}): React.JSX.Element {
  return (
    <Badge className={cn(RISK_BADGE_CLASSES[risk], className)}>
      {PROJECT_RISK_LABELS[risk]}
    </Badge>
  );
}
