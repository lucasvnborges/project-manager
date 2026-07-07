import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('API de Gestao de Projetos')
    .setDescription(
      'API para cadastro, consulta, edicao, remocao, transicao de status e ' +
        'analise com IA de projetos. Consulte o README do repositorio para o ' +
        'detalhamento das regras de negocio.',
    )
    .setVersion('1.0')
    .addTag('projects', 'Cadastro, consulta e ciclo de vida dos projetos')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3001;
  await app.listen(port);
}
bootstrap();
