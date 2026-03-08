import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../../../src/ui/components/StatusBadge';
import type { EventStatus } from '../../../src/domain/models';

describe('StatusBadge', () => {
  const cases: { status: EventStatus; label: string; colorClass: string }[] = [
    { status: 'not_started', label: 'Sin iniciar', colorClass: 'bg-gray-100' },
    { status: 'in_progress', label: 'En progreso', colorClass: 'bg-blue-100' },
    { status: 'completed', label: 'Completado', colorClass: 'bg-green-100' },
    { status: 'cancelled', label: 'Cancelado', colorClass: 'bg-red-100' },
  ];

  cases.forEach(({ status, label, colorClass }) => {
    it(`renders "${label}" for status "${status}"`, () => {
      render(<StatusBadge status={status} />);
      const badge = screen.getByText(label);
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain(colorClass);
    });
  });
});
