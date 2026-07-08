import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AI_CLIENT } from './ai-client.interface';
import { AiAnalysisService } from './ai-analysis.service';
import { MockAiClient } from './clients/mock.client';
import { OllamaClient } from './clients/ollama.client';
import { ProjectAnalysisPromptBuilder } from './project-analysis-prompt.builder';

const logger = new Logger('AiAnalysisModule');

@Module({
  providers: [
    ProjectAnalysisPromptBuilder,
    AiAnalysisService,
    {
      provide: AI_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const provider = config.get<string>('AI_PROVIDER');

        if (provider === 'ollama') {
          const baseUrl =
            config.get<string>('OLLAMA_BASE_URL') ?? 'http://localhost:11434';
          const model = config.get<string>('OLLAMA_MODEL') ?? 'llama3.2';

          logger.log(
            `Usando OllamaClient (${baseUrl}, modelo ${model}) para análise com IA.`,
          );

          return new OllamaClient({ baseUrl, model });
        }

        logger.warn(
          'Usando MockAiClient (sem custo/rede) para análise com IA. ' +
            'Configure AI_PROVIDER=ollama para usar o Ollama.',
        );
        return new MockAiClient();
      },
    },
  ],
  exports: [AiAnalysisService],
})
export class AiAnalysisModule {}
