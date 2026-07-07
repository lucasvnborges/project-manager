import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api-client';

export function projectQueryKey(id: string) {
  return ['projects', id] as const;
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectQueryKey(id),
    queryFn: () => projectsApi.getById(id),
    enabled: Boolean(id),
  });
}
