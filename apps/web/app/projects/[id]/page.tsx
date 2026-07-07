import { AppShell } from '@/components/layout/app-shell';
import { ProjectDetailClient } from '@/components/projects/project-detail-client';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;

  return (
    <AppShell>
      <ProjectDetailClient projectId={id} />
    </AppShell>
  );
}
