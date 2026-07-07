import { AppShell } from '@/components/layout/app-shell';
import { ProjectsPageClient } from '@/components/projects/projects-page-client';

export default function ProjectsPage(): React.JSX.Element {
  return (
    <AppShell>
      <ProjectsPageClient />
    </AppShell>
  );
}
