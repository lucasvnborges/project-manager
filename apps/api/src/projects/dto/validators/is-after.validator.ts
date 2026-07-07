import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * Valida que o campo decorado representa uma data posterior a de outro
 * campo do mesmo objeto (ex.: endDate deve ser posterior a startDate).
 * Se um dos dois valores nao estiver presente, a validacao e ignorada
 * aqui (cabe ao @IsDateString/@IsNotEmpty de cada campo cobrir isso).
 */
export function IsAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAfter',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const relatedPropertyName = args.constraints[0] as string;
          const relatedValue = (args.object as Record<string, unknown>)[
            relatedPropertyName
          ];
          if (!value || !relatedValue) return true;
          return (
            new Date(value as string).getTime() >
            new Date(relatedValue as string).getTime()
          );
        },
        defaultMessage(args: ValidationArguments) {
          const relatedPropertyName = args.constraints[0] as string;
          return `${args.property} deve ser posterior a ${relatedPropertyName}`;
        },
      },
    });
  };
}
