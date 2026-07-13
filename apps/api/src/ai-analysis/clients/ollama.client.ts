import { Injectable, Logger } from '@nestjs/common';
import { AiClient } from '../ai-client.interface';
import { AiProviderException } from '../exceptions/ai-provider.exception';

export interface OllamaClientOptions {
  baseUrl: string;
  model: string;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 180_000;

interface OllamaChatResponse {
  message?: {
    content?: string;
  };
}

/**
 * Implementação do AiClient usando a API HTTP do Ollama (/api/chat).
 * Usa `format: json` para orientar o modelo a retornar JSON estruturado.
 */
@Injectable()
export class OllamaClient implements AiClient {
  private readonly logger = new Logger(OllamaClient.name);
  private readonly chatUrl: string;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(options: OllamaClientOptions) {
    this.chatUrl = `${options.baseUrl.replace(/\/$/, '')}/api/chat`;
    this.model = options.model;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async complete(prompt: string): Promise<string> {
    try {
      const response = await fetch(this.chatUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(this.timeoutMs),
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
          format: 'json',
          keep_alive: '10m',
          options: {
            temperature: 0.3,
            num_predict: 400,
          },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(
          `Ollama respondeu com status ${response.status}: ${errorBody}`,
        );
        throw new AiProviderException(
          'Falha ao comunicar com o provedor de IA. Verifique se o Ollama está em execução e se o modelo foi baixado.',
        );
      }

      const data = (await response.json()) as OllamaChatResponse;
      const content = data.message?.content;

      if (!content) {
        this.logger.warn('Resposta do Ollama sem conteúdo utilizável.');
        throw new AiProviderException('Resposta vazia do provedor de IA.');
      }

      return content;
    } catch (error) {
      if (error instanceof AiProviderException) {
        throw error;
      }

      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new AiProviderException(
          'A análise demorou mais que o esperado. Tente novamente em instantes.',
        );
      }

      if (error instanceof TypeError) {
        this.logger.error('Falha de rede ao chamar o Ollama.', error.stack);
        throw new AiProviderException(
          'Não foi possível conectar ao serviço de IA. Verifique se o Ollama está em execução.',
        );
      }

      throw error;
    }
  }
}
