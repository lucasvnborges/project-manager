import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

/**
 * Configuracao compartilhada da aplicacao (pipes globais, filtro de
 * excecoes, CORS). Usada tanto pelo bootstrap real (main.ts) quanto
 * pelos testes e2e, garantindo que ambos se comportem de forma
 * identica em producao e em teste.
 */
export function configureApp(app: INestApplication): void {
  const configService = app.get(ConfigService);

  const corsOrigin = configService.get<string>('CORS_ORIGIN') ?? 'http://localhost:3000';
  const origins = corsOrigin.split(',').map((origin) => origin.trim());

  app.enableCors({
    origin: origins.length === 1 ? origins[0] : origins,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
}
