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
