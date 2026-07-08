/**
 * Porta (interface) para qualquer provedor capaz de gerar texto a
 * partir de um prompt. Isola o restante da aplicacao do SDK/provedor
 * de IA específico (ver clients/ollama.client.ts e clients/mock.client.ts).
 * Trocar de provedor (ou usar mais de um) significa apenas implementar
 * esta interface, sem tocar em AiAnalysisService ou no controller.
 */
export interface AiClient {
  complete(prompt: string): Promise<string>;
}

export const AI_CLIENT = Symbol('AI_CLIENT');
