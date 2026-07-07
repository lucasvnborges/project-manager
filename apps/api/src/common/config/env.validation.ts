import * as Joi from 'joi';

/**
 * Schema de validacao das variaveis de ambiente, aplicado no boot da
 * aplicacao (ConfigModule.forRoot({ validationSchema })). Falha rapido
 * e com mensagem clara caso alguma variavel obrigatoria esteja ausente
 * ou em formato invalido.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3001),
  DATABASE_URL: Joi.string().required(),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  AI_PROVIDER: Joi.string().valid('openai', 'mock').default('mock'),
  OPENAI_API_KEY: Joi.string().allow('').optional(),
  OPENAI_MODEL: Joi.string().default('gpt-4o-mini'),
});
