import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api-client';

export const PROJECTS_QUERY_KEY = ['projects'] as const;

export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: projectsApi.list,
  });
}
