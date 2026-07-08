import { Injectable } from '@nestjs/common';
import { AiClient } from '../ai-client.interface';

/**
 * Implementacao de fallback do AiClient: nao faz nenhuma chamada de
 * rede/custo, apenas devolve um JSON generico e plausivel no mesmo
 * formato esperado do provedor real. Usada automaticamente quando
 * AI_PROVIDER=mock ou quando AI_PROVIDER=ollama não está disponível (ver
 * ai-analysis.module.ts), e tambem nos testes automatizados.
 */
@Injectable()
export class MockAiClient implements AiClient {
  complete(): Promise<string> {
    return Promise.resolve(
      JSON.stringify({
        summary:
          'Análise gerada em modo simulado (sem chamada a um provedor de IA real). ' +
          'Este texto ilustra o formato de resposta esperado da funcionalidade.',
        attentionPoints: [
          'Configure AI_PROVIDER=ollama e suba o serviço Ollama para obter uma análise real.',
          'Revise prazos e orçamento periodicamente para manter o risco calculado atualizado.',
        ],
        executiveRecommendation:
          'Nenhuma recomendação real disponível no modo simulado; trate este retorno apenas como exemplo estrutural.',
      }),
    );
  }
}
