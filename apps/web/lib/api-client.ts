import type {
  ApiErrorResponse,
  ChangeProjectStatusInput,
  CreateProjectInput,
  Project,
  ProjectAiAnalysis,
  UpdateProjectInput,
} from '@repo/shared-types';

function resolveApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;

  if (configured !== undefined && configured !== '') {
    return configured.replace(/\/$/, '');
  }

  if (
    typeof window !== 'undefined' &&
    process.env.NODE_ENV === 'production'
  ) {
    return '';
  }

  return 'http://localhost:3001';
}

const API_URL = resolveApiUrl();

/**
 * Erro tipado lancado pelo cliente HTTP, carregando o statusCode e (se
 * disponivel) a lista de mensagens de validacao devolvidas pela API,
 * para que a UI possa exibir feedback especifico ao usuario.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly details?: string[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const HTTP_STATUS_NO_CONTENT = 204;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (response.status === HTTP_STATUS_NO_CONTENT) {
    return undefined as T;
  }

  const body: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    const errorBody = body as ApiErrorResponse | undefined;
    const message = Array.isArray(errorBody?.message)
      ? errorBody.message.join(', ')
      : errorBody?.message ?? 'Erro inesperado ao comunicar com a API.';

    throw new ApiError(
      message,
      response.status,
      Array.isArray(errorBody?.message) ? errorBody.message : undefined,
    );
  }

  return body as T;
}

export const projectsApi = {
  list: (): Promise<Project[]> => request<Project[]>('/projects'),

  getById: (id: string): Promise<Project> =>
    request<Project>(`/projects/${id}`),

  create: (input: CreateProjectInput): Promise<Project> =>
    request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: string, input: UpdateProjectInput): Promise<Project> =>
    request<Project>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  remove: (id: string): Promise<void> =>
    request<void>(`/projects/${id}`, { method: 'DELETE' }),

  changeStatus: (
    id: string,
    input: ChangeProjectStatusInput,
  ): Promise<Project> =>
    request<Project>(`/projects/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  getAiAnalysis: (id: string): Promise<ProjectAiAnalysis> =>
    request<ProjectAiAnalysis>(`/projects/${id}/ai-analysis`),
};
