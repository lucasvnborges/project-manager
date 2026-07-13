'use client';

import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGenerateAiAnalysis } from '@/hooks/use-ai-analysis';
import { ApiError } from '@/lib/api-client';

/**
 * Painel de analise com IA: solicita a analise sob demanda (nunca no
 * carregamento automatico da pagina, para nao gerar custo/latencia
 * sem uma acao explicita do usuario) e exibe resumo, pontos de atencao
 * e recomendacao executiva retornados por GET /projects/:id/ai-analysis.
 */
export function AiAnalysisPanel({
  projectId,
}: {
  projectId: string;
}): React.JSX.Element {
  const generateAnalysis = useGenerateAiAnalysis(projectId);

  return (
    <div
      id="ai-analysis"
      className="rounded-card border border-line bg-surface p-6 shadow-subtle"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-ink">
            Análise com IA
          </h2>
          <p className="text-sm text-ink-muted">
            Resumo, pontos de atenção e recomendação executiva gerados com
            apoio de IA.
          </p>
        </div>
        <Button
          onClick={() => generateAnalysis.mutate()}
          disabled={generateAnalysis.isPending}
        >
          <Sparkles className="h-4 w-4" />
          {generateAnalysis.isPending
            ? 'Gerando...'
            : generateAnalysis.data
              ? 'Gerar novamente'
              : 'Gerar análise'}
        </Button>
      </div>

      {generateAnalysis.isPending && (
        <p className="mt-4 text-sm text-ink-muted">
          A primeira análise pode levar até 2 minutos enquanto o modelo de IA
          é carregado. Aguarde sem fechar a página.
        </p>
      )}

      {generateAnalysis.isError && (
        <p className="mt-4 text-sm text-risk-alto-content">
          {generateAnalysis.error instanceof ApiError
            ? generateAnalysis.error.message
            : 'Não foi possível gerar a análise. Tente novamente.'}
        </p>
      )}

      {generateAnalysis.data && (
        <div className="mt-4 flex flex-col gap-4 text-sm">
          <div>
            <h3 className="font-medium text-ink">Resumo</h3>
            <p className="text-ink-muted">{generateAnalysis.data.summary}</p>
          </div>

          {generateAnalysis.data.attentionPoints.length > 0 && (
            <div>
              <h3 className="font-medium text-ink">Pontos de atenção</h3>
              <ul className="list-disc pl-5 text-ink-muted">
                {generateAnalysis.data.attentionPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="font-medium text-ink">Recomendação executiva</h3>
            <p className="text-ink-muted">
              {generateAnalysis.data.executiveRecommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
