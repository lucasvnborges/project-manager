import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ChangeProjectStatusInput,
  CreateProjectInput,
  UpdateProjectInput,
} from '@repo/shared-types';
import { projectsApi } from '@/lib/api-client';
import { projectQueryKey } from './use-project';
import { PROJECTS_QUERY_KEY } from './use-projects';

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectsApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProjectInput) => projectsApi.update(id, input),
    onSuccess: (project) => {
      void queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      queryClient.setQueryData(projectQueryKey(id), project);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

export function useChangeProjectStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ChangeProjectStatusInput) =>
      projectsApi.changeStatus(id, input),
    onSuccess: (project) => {
      void queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      queryClient.setQueryData(projectQueryKey(id), project);
    },
  });
}
