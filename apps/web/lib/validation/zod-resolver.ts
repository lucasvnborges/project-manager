import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form';
import type { ZodType } from 'zod';

/**
 * Adaptador minimo entre Zod e react-hook-form, escrito a mao em vez
 * de usar o pacote @hookform/resolvers: no momento em que este projeto
 * foi construido, a versao mais recente do resolver oficial nao era
 * compativel com a versao mais recente do zod (incompatibilidade nos
 * tipos internos entre os dois pacotes). Este adaptador e pequeno,
 * nao tem dependencias extras e evita esse acoplamento de versoes.
 */
export function zodResolver<T extends FieldValues>(
  schema: ZodType<T>,
): Resolver<T> {
  return async (values) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.') || 'root';
      if (!errors[path]) {
        errors[path] = { type: issue.code, message: issue.message };
      }
    }

    return { values: {}, errors: errors as FieldErrors<T> };
  };
}
