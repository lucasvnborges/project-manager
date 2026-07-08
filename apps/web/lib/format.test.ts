import { describe, expect, it } from 'vitest';
import {
  formatBudgetInputValue,
  parseBudgetInputValue,
} from './format';

describe('formatBudgetInputValue', () => {
  it('formata com duas casas decimais', () => {
    expect(formatBudgetInputValue(1234.5)).toBe('1.234,50');
    expect(formatBudgetInputValue(0)).toBe('0,00');
  });
});

describe('parseBudgetInputValue', () => {
  it('trata os dois últimos dígitos como centavos', () => {
    expect(parseBudgetInputValue('1')).toBe(0.01);
    expect(parseBudgetInputValue('12')).toBe(0.12);
    expect(parseBudgetInputValue('123456')).toBe(1234.56);
    expect(parseBudgetInputValue('1.234,56')).toBe(1234.56);
  });
});
