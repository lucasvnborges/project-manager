import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { AiClient } from '../ai-client.interface';

export interface OpenAiClientOptions {
  apiKey: string;
  model: string;
}

/**
 * Implementacao real do AiClient usando a API da OpenAI. Concentra
 * todo o acoplamento ao SDK/vendor nesta classe: se o provedor mudar
 * no futuro, basta criar um novo AiClient e trocar o provider no
 * ai-analysis.module.ts (o restante da aplicacao nao muda).
 */
@Injectable()
export class OpenAiClient implements AiClient {
  private readonly logger = new Logger(OpenAiClient.name);
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(options: OpenAiClientOptions) {
    this.client = new OpenAI({ apiKey: options.apiKey });
    this.model = options.model;
  }

  async complete(prompt: string): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      this.logger.warn('Resposta da OpenAI sem conteudo utilizavel.');
      throw new Error('Resposta vazia do provedor de IA.');
    }

    return content;
  }
}
