import { render, screen } from '@testing-library/react';
import { ProjectStatus } from '@repo/shared-types';
import { describe, expect, it } from 'vitest';
import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  it.each([
    [ProjectStatus.EM_ANALISE, 'Em análise'],
    [ProjectStatus.APROVADO, 'Aprovado'],
    [ProjectStatus.EM_ANDAMENTO, 'Em andamento'],
    [ProjectStatus.ENCERRADO, 'Encerrado'],
    [ProjectStatus.CANCELADO, 'Cancelado'],
  ])('exibe o rotulo em portugues para %s', (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
