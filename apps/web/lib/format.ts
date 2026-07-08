/** Converte uma data ISO para o formato aceito por `<input type="date">` (YYYY-MM-DD). */
export function toDateInputValue(isoDate: string): string {
  return isoDate.slice(0, 10);
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('pt-BR');
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/** Formata um valor numérico para exibição em input de orçamento (ex.: 1234.5 → "1.234,50"). */
export function formatBudgetInputValue(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Converte a entrada mascarada em número, tratando os dois últimos dígitos como centavos. */
export function parseBudgetInputValue(input: string): number {
  const digits = input.replace(/\D/g, '');
  return Number(digits || '0') / 100;
}
