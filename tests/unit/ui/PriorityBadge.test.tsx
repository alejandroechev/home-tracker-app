import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriorityBadge } from '../../../src/ui/components/PriorityBadge';
import type { Priority } from '../../../src/domain/models';

describe('PriorityBadge', () => {
  const cases: { priority: Priority; label: string; colorClass: string }[] = [
    { priority: 'low', label: 'Baja', colorClass: 'bg-gray-100' },
    { priority: 'medium', label: 'Media', colorClass: 'bg-yellow-100' },
    { priority: 'high', label: 'Alta', colorClass: 'bg-orange-100' },
    { priority: 'urgent', label: 'Urgente', colorClass: 'bg-red-100' },
  ];

  cases.forEach(({ priority, label, colorClass }) => {
    it(`renders "${label}" for priority "${priority}"`, () => {
      render(<PriorityBadge priority={priority} />);
      const badge = screen.getByText(label);
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain(colorClass);
    });
  });
});
