import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('API de gestão de projetos')
    .setDescription(
      'API para cadastro, consulta, edição, remoção, transição de status e ' +
        'análise com IA de projetos. Consulte o README do repositório para o ' +
        'detalhamento das regras de negócio.',
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
void bootstrap();
