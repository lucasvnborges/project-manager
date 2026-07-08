import { Input } from '@/components/ui/input';
import {
  formatBudgetInputValue,
  parseBudgetInputValue,
} from '@/lib/format';

interface BudgetInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
}

export function BudgetInput({
  id,
  value,
  onChange,
  onBlur,
}: BudgetInputProps): React.JSX.Element {
  return (
    <Input
      id={id}
      inputMode="numeric"
      autoComplete="off"
      value={formatBudgetInputValue(value)}
      onChange={(event) => onChange(parseBudgetInputValue(event.target.value))}
      onBlur={onBlur}
    />
  );
}
