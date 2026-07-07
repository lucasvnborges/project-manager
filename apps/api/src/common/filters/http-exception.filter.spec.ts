import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { ProjectStatus } from '@repo/shared-types';
import { ProjectNotFoundException } from '../../projects/exceptions/project-not-found.exception';
import { InvalidStatusTransitionException } from '../../projects/exceptions/invalid-status-transition.exception';
import { HttpExceptionFilter } from './http-exception.filter';

function createMockHost(): {
  host: ArgumentsHost;
  json: jest.Mock;
  status: jest.Mock;
} {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const request = { url: '/projects/123', originalUrl: '/projects/123' };
  const response = { status };

  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => request,
    }),
  } as unknown as ArgumentsHost;

  return { host, json, status };
}

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('traduz uma DomainException para o status http declarado por ela', () => {
    const { host, json, status } = createMockHost();

    filter.catch(new ProjectNotFoundException('abc-123'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message: expect.stringContaining('abc-123'),
        path: '/projects/123',
      }),
    );
  });

  it('traduz InvalidStatusTransitionException para 409 Conflict', () => {
    const { host, status } = createMockHost();

    filter.catch(
      new InvalidStatusTransitionException(
        ProjectStatus.EM_ANALISE,
        ProjectStatus.EM_ANDAMENTO,
      ),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('repassa mensagens de validacao (array) de um HttpException padrao do Nest', () => {
    const { host, json, status } = createMockHost();

    filter.catch(
      new BadRequestException(['name nao pode ser vazio', 'budget deve ser positivo']),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: [
          'name nao pode ser vazio',
          'budget deve ser positivo',
        ],
      }),
    );
  });

  it('trata erros inesperados como 500 sem expor detalhes internos', () => {
    const { host, json, status } = createMockHost();

    filter.catch(new Error('falha inesperada de infraestrutura'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro interno inesperado.',
      }),
    );
  });
});
