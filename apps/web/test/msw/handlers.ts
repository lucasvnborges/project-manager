import type { HttpHandler } from 'msw';

/**
 * Handlers padrao (vazios): cada teste registra os handlers especificos
 * que precisa via `server.use(...)`, mantendo os mocks proximos ao
 * cenario testado em vez de um mock global unico e dificil de manter.
 */
export const handlers: HttpHandler[] = [];
