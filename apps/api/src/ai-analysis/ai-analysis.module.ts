import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AI_CLIENT } from './ai-client.interface';
import { AiAnalysisService } from './ai-analysis.service';
import { MockAiClient } from './clients/mock.client';
import { OpenAiClient } from './clients/openai.client';
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
        const apiKey = config.get<string>('OPENAI_API_KEY');

        if (provider === 'openai' && apiKey) {
          logger.log('Usando OpenAiClient (integracao real) para analise com IA.');
          return new OpenAiClient({
            apiKey,
            model: config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini',
          });
        }

        logger.warn(
          'Usando MockAiClient (sem custo/rede) para analise com IA. ' +
            'Configure AI_PROVIDER=openai e OPENAI_API_KEY para usar a integracao real.',
        );
        return new MockAiClient();
      },
    },
  ],
  exports: [AiAnalysisService],
})
export class AiAnalysisModule {}
