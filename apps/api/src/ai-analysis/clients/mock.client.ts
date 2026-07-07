import { Injectable } from '@nestjs/common';
import { AiClient } from '../ai-client.interface';

/**
 * Implementacao de fallback do AiClient: nao faz nenhuma chamada de
 * rede/custo, apenas devolve um JSON generico e plausivel no mesmo
 * formato esperado do provedor real. Usada automaticamente quando
 * AI_PROVIDER=mock ou quando OPENAI_API_KEY nao esta configurada (ver
 * ai-analysis.module.ts), e tambem nos testes automatizados.
 */
@Injectable()
export class MockAiClient implements AiClient {
  async complete(): Promise<string> {
    return JSON.stringify({
      summary:
        'Analise gerada em modo simulado (sem chamada a um provedor de IA real). ' +
        'Este texto ilustra o formato de resposta esperado da funcionalidade.',
      attentionPoints: [
        'Configure AI_PROVIDER=openai e OPENAI_API_KEY para obter uma analise real.',
        'Revise prazos e orcamento periodicamente para manter o risco calculado atualizado.',
      ],
      executiveRecommendation:
        'Nenhuma recomendacao real disponivel no modo simulado; trate este retorno apenas como exemplo estrutural.',
    });
  }
}
