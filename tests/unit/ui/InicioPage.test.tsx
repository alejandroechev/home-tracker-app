import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InicioPage } from '../../../src/ui/pages/InicioPage';
import type { HomeEvent, HomeArea } from '../../../src/domain/models';

vi.mock('../../../src/infra/store-provider', () => ({
  getAllEvents: vi.fn(),
  getAllAreas: vi.fn(),
}));

import { getAllEvents, getAllAreas } from '../../../src/infra/store-provider';

const mockGetAllEvents = vi.mocked(getAllEvents);
const mockGetAllAreas = vi.mocked(getAllAreas);

function makeEvent(overrides: Partial<HomeEvent> = {}): HomeEvent {
  return {
    id: 'evt-1',
    date: '2024-06-01',
    type: 'Reparación',
    title: 'Fix faucet',
    description: 'Leaky faucet',
    areaId: 'area-1',
    priority: 'high',
    status: 'not_started',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    ...overrides,
  };
}

const sampleAreas: HomeArea[] = [
  { id: 'area-1', name: 'Cocina', createdAt: '2024-01-01T00:00:00Z' },
];

describe('InicioPage', () => {
  let mockOnEventClick: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnEventClick = vi.fn();
    mockGetAllAreas.mockResolvedValue(sampleAreas);
  });

  it('should show loading state', () => {
    // Make getAllEvents never resolve to keep loading
    mockGetAllEvents.mockReturnValue(new Promise(() => {}));

    render(<InicioPage onEventClick={mockOnEventClick} />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('should show empty state when no events exist', async () => {
    mockGetAllEvents.mockResolvedValue([]);

    render(<InicioPage onEventClick={mockOnEventClick} />);

    await waitFor(() => {
      expect(screen.getByText('No hay eventos registrados')).toBeInTheDocument();
    });
  });

  it('should render event cards when events exist', async () => {
    const events = [
      makeEvent({ id: 'e1', title: 'Fix pipe' }),
      makeEvent({ id: 'e2', title: 'Paint wall' }),
    ];
    mockGetAllEvents.mockResolvedValue(events);

    render(<InicioPage onEventClick={mockOnEventClick} />);

    await waitFor(() => {
      expect(screen.getByText('Fix pipe')).toBeInTheDocument();
      expect(screen.getByText('Paint wall')).toBeInTheDocument();
    });
  });

  it('should show "Eventos recientes" heading', async () => {
    mockGetAllEvents.mockResolvedValue([makeEvent()]);

    render(<InicioPage onEventClick={mockOnEventClick} />);

    await waitFor(() => {
      expect(screen.getByText('Eventos recientes')).toBeInTheDocument();
    });
  });

  it('should limit to 10 most recent events', async () => {
    const events = Array.from({ length: 15 }, (_, i) =>
      makeEvent({ id: `e-${i}`, title: `Event ${i}` }),
    );
    mockGetAllEvents.mockResolvedValue(events);

    render(<InicioPage onEventClick={mockOnEventClick} />);

    await waitFor(() => {
      expect(screen.getByText('Event 0')).toBeInTheDocument();
      expect(screen.getByText('Event 9')).toBeInTheDocument();
    });

    expect(screen.queryByText('Event 10')).not.toBeInTheDocument();
    expect(screen.queryByText('Event 14')).not.toBeInTheDocument();
  });

  it('should call onEventClick when a card is clicked', async () => {
    mockGetAllEvents.mockResolvedValue([makeEvent({ id: 'evt-abc', title: 'Click me' })]);

    render(<InicioPage onEventClick={mockOnEventClick} />);

    await waitFor(() => {
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Click me'));
    expect(mockOnEventClick).toHaveBeenCalledWith('evt-abc');
  });
});
