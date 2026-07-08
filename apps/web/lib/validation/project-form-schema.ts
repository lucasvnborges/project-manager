import { z } from 'zod';

/**
 * Validacao do formulario de projeto no cliente. Espelha as regras do
 * backend (CreateProjectDto) para dar feedback imediato ao usuario,
 * mas a API e sempre a fonte de verdade final (revalidada no servidor).
 */
export const projectFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Informe o nome do projeto.')
      .max(150, 'O nome deve ter no máximo 150 caracteres.'),
    startDate: z.string().min(1, 'Informe a data de início.'),
    endDate: z.string().min(1, 'Informe a previsão de término.'),
    budget: z
      .number({ message: 'Informe um valor numérico.' })
      .min(0, 'O orçamento não pode ser negativo.'),
    description: z.string().trim().min(1, 'Informe uma descrição.'),
  })
  .refine(
    (data) => new Date(data.endDate).getTime() > new Date(data.startDate).getTime(),
    {
      message: 'A previsão de término deve ser posterior à data de início.',
      path: ['endDate'],
    },
  );

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const emptyProjectFormValues: ProjectFormValues = {
  name: '',
  startDate: '',
  endDate: '',
  budget: 0,
  description: '',
};
