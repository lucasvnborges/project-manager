import { useMutation } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api-client';

export function useGenerateAiAnalysis(projectId: string) {
  return useMutation({
    mutationFn: () => projectsApi.getAiAnalysis(projectId),
  });
}
