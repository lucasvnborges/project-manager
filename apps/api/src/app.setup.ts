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

  app.enableCors({ origin: configService.get<string>('CORS_ORIGIN') });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
}
