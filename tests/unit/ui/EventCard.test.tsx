import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventCard } from '../../../src/ui/components/EventCard';
import type { HomeEvent } from '../../../src/domain/models';

const mockEvent: HomeEvent = {
  id: 'evt-1',
  date: '2024-06-15',
  type: 'Reparación',
  title: 'Arreglar llave del baño',
  description: 'La llave gotea',
  areaId: 'area-1',
  priority: 'high',
  status: 'in_progress',
  createdAt: '2024-06-15T00:00:00Z',
  updatedAt: '2024-06-15T00:00:00Z',
};

describe('EventCard', () => {
  it('renders event title and date', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('Arreglar llave del baño')).toBeInTheDocument();
    expect(screen.getByText('2024-06-15')).toBeInTheDocument();
  });

  it('renders event type', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('Reparación')).toBeInTheDocument();
  });

  it('renders area name when provided', () => {
    render(<EventCard event={mockEvent} areaName="Baño" />);
    expect(screen.getByText('Baño')).toBeInTheDocument();
  });

  it('renders status and priority badges', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('En progreso')).toBeInTheDocument();
    expect(screen.getByText('Alta')).toBeInTheDocument();
  });

  it('renders costs when totalCost exists', () => {
    const eventWithCost = { ...mockEvent, totalCost: 15000 };
    render(<EventCard event={eventWithCost} />);
    expect(screen.getByText(/Total:/)).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<EventCard event={mockEvent} onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
