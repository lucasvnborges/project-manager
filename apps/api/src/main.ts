import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({ origin: configService.get<string>('CORS_ORIGIN') });

  const port = configService.get<number>('PORT') ?? 3001;
  await app.listen(port);
}
bootstrap();
