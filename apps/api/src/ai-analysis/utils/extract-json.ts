/**
 * Extrai um objeto JSON de um texto livre, tolerando respostas de
 * modelos de IA que envolvam o JSON em blocos markdown (```json ... ```)
 * ou que adicionem texto antes/depois do objeto.
 */
export function extractJsonObject(text: string): string {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch) {
    return fencedMatch[1].trim();
  }

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }

  return text.trim();
}
