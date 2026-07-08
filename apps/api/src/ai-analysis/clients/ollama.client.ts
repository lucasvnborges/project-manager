import { Injectable, Logger } from '@nestjs/common';
import { AiClient } from '../ai-client.interface';

export interface OllamaClientOptions {
  baseUrl: string;
  model: string;
}

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

  constructor(options: OllamaClientOptions) {
    this.chatUrl = `${options.baseUrl.replace(/\/$/, '')}/api/chat`;
    this.model = options.model;
  }

  async complete(prompt: string): Promise<string> {
    const response = await fetch(this.chatUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        format: 'json',
        options: { temperature: 0.3 },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(
        `Ollama respondeu com status ${response.status}: ${errorBody}`,
      );
      throw new Error('Falha ao comunicar com o provedor de IA.');
    }

    const data = (await response.json()) as OllamaChatResponse;
    const content = data.message?.content;

    if (!content) {
      this.logger.warn('Resposta do Ollama sem conteúdo utilizável.');
      throw new Error('Resposta vazia do provedor de IA.');
    }

    return content;
  }
}
