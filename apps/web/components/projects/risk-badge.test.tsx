import { render, screen } from '@testing-library/react';
import { ProjectRisk } from '@repo/shared-types';
import { describe, expect, it } from 'vitest';
import { RiskBadge } from './risk-badge';

describe('RiskBadge', () => {
  it.each([
    [ProjectRisk.BAIXO, 'Baixo'],
    [ProjectRisk.MEDIO, 'Médio'],
    [ProjectRisk.ALTO, 'Alto'],
  ])('exibe o rotulo em portugues para %s', (risk, label) => {
    render(<RiskBadge risk={risk} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
