import { AppShell } from '@/components/layout/app-shell';
import { ProjectsPageClient } from '@/components/projects/projects-page-client';

export default function RootPage(): React.JSX.Element {
  return (
    <AppShell>
      <ProjectsPageClient />
    </AppShell>
  );
}
