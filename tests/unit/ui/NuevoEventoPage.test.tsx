import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NuevoEventoPage } from '../../../src/ui/pages/NuevoEventoPage';

vi.mock('../../../src/infra/store-provider', () => ({
  createEvent: vi.fn(),
}));

vi.mock('../../../src/ui/components/EventForm', () => ({
  EventForm: ({ onSubmit }: { onSubmit: (input: any) => Promise<void> }) => (
    <button
      onClick={() =>
        void onSubmit({
          date: '2024-01-01',
          type: 'Reparación',
          title: 'Test',
          description: 'Test desc',
          areaId: 'a1',
          priority: 'medium',
        })
      }
    >
      MockSubmit
    </button>
  ),
}));

import { createEvent } from '../../../src/infra/store-provider';

const mockCreateEvent = vi.mocked(createEvent);

describe('NuevoEventoPage', () => {
  let mockOnSuccess: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSuccess = vi.fn();
    mockCreateEvent.mockResolvedValue({
      id: 'new-evt',
      date: '2024-01-01',
      type: 'Reparación',
      title: 'Test',
      description: 'Test desc',
      areaId: 'a1',
      priority: 'medium',
      status: 'not_started',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    });
  });

  it('should render "Nuevo Evento" heading', () => {
    render(<NuevoEventoPage onSuccess={mockOnSuccess} />);
    expect(screen.getByText('Nuevo Evento')).toBeInTheDocument();
  });

  it('should render EventForm (mocked)', () => {
    render(<NuevoEventoPage onSuccess={mockOnSuccess} />);
    expect(screen.getByText('MockSubmit')).toBeInTheDocument();
  });

  it('should call createEvent and onSuccess when form is submitted', async () => {
    render(<NuevoEventoPage onSuccess={mockOnSuccess} />);

    fireEvent.click(screen.getByText('MockSubmit'));

    await waitFor(() => {
      expect(mockCreateEvent).toHaveBeenCalledWith({
        date: '2024-01-01',
        type: 'Reparación',
        title: 'Test',
        description: 'Test desc',
        areaId: 'a1',
        priority: 'medium',
      });
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });
});
