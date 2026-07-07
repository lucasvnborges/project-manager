import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectStatus } from '@repo/shared-types';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

describe('Projects (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  function validProjectPayload(overrides: Record<string, unknown> = {}) {
    return {
      name: 'Projeto e2e',
      startDate: '2026-01-01',
      endDate: '2026-02-01',
      budget: 50_000,
      description: 'Projeto criado durante o teste e2e',
      ...overrides,
    };
  }

  describe('POST /projects', () => {
    it('cria um projeto com status EM_ANALISE e risco calculado', async () => {
      const response = await request(app.getHttpServer())
        .post('/projects')
        .send(validProjectPayload())
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'Projeto e2e',
        status: ProjectStatus.EM_ANALISE,
        risk: 'BAIXO',
      });
      expect(response.body.id).toBeDefined();
    });

    it('retorna 400 quando campos obrigatorios estao ausentes', async () => {
      const response = await request(app.getHttpServer())
        .post('/projects')
        .send({})
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(Array.isArray(response.body.message)).toBe(true);
    });

    it('retorna 400 quando a previsao de termino nao e posterior ao inicio', async () => {
      await request(app.getHttpServer())
        .post('/projects')
        .send(
          validProjectPayload({ startDate: '2026-06-01', endDate: '2026-01-01' }),
        )
        .expect(400);
    });
  });

  describe('fluxo completo de um projeto', () => {
    let projectId: string;

    it('GET /projects lista o projeto recem criado', async () => {
      const created = await request(app.getHttpServer())
        .post('/projects')
        .send(validProjectPayload({ name: 'Projeto para listagem' }));
      projectId = created.body.id;

      const response = await request(app.getHttpServer())
        .get('/projects')
        .expect(200);

      expect(
        response.body.some((project: { id: string }) => project.id === projectId),
      ).toBe(true);
    });

    it('GET /projects/:id retorna o projeto', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}`)
        .expect(200);

      expect(response.body.id).toBe(projectId);
    });

    it('GET /projects/:id retorna 404 para id inexistente', async () => {
      await request(app.getHttpServer())
        .get('/projects/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('PATCH /projects/:id atualiza dados e recalcula o risco', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}`)
        .send({ budget: 600_000 })
        .expect(200);

      expect(response.body.budget).toBe(600_000);
      expect(response.body.risk).toBe('ALTO');
    });

    it('PATCH /projects/:id/status rejeita transicao que pula etapas', async () => {
      await request(app.getHttpServer())
        .patch(`/projects/${projectId}/status`)
        .send({ status: ProjectStatus.EM_ANDAMENTO })
        .expect(409);
    });

    it('PATCH /projects/:id/status avanca corretamente Em analise -> Aprovado -> Em andamento', async () => {
      await request(app.getHttpServer())
        .patch(`/projects/${projectId}/status`)
        .send({ status: ProjectStatus.APROVADO })
        .expect(200);

      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/status`)
        .send({ status: ProjectStatus.EM_ANDAMENTO })
        .expect(200);

      expect(response.body.status).toBe(ProjectStatus.EM_ANDAMENTO);
    });

    it('DELETE /projects/:id bloqueia remocao de projeto Em andamento', async () => {
      await request(app.getHttpServer())
        .delete(`/projects/${projectId}`)
        .expect(409);
    });
  });

  describe('remocao de projeto sem restricao de status', () => {
    it('DELETE /projects/:id remove projeto Em analise (204) e passa a retornar 404', async () => {
      const created = await request(app.getHttpServer())
        .post('/projects')
        .send(validProjectPayload({ name: 'Projeto para remocao' }));

      await request(app.getHttpServer())
        .delete(`/projects/${created.body.id}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/projects/${created.body.id}`)
        .expect(404);
    });
  });
});
