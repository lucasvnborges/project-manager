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
      .max(150, 'O nome deve ter no maximo 150 caracteres.'),
    startDate: z.string().min(1, 'Informe a data de inicio.'),
    endDate: z.string().min(1, 'Informe a previsao de termino.'),
    budget: z
      .number({ message: 'Informe um valor numerico.' })
      .min(0, 'O orcamento nao pode ser negativo.'),
    description: z.string().trim().min(1, 'Informe uma descricao.'),
  })
  .refine(
    (data) => new Date(data.endDate).getTime() > new Date(data.startDate).getTime(),
    {
      message: 'A previsao de termino deve ser posterior a data de inicio.',
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
