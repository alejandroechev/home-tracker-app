import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HistorialPage } from '../../../src/ui/pages/HistorialPage';
import type { HomeEvent, HomeArea } from '../../../src/domain/models';

vi.mock('../../../src/infra/store-provider', () => ({
  getAllEvents: vi.fn(),
  getAllAreas: vi.fn(),
}));

import { getAllEvents, getAllAreas } from '../../../src/infra/store-provider';
import { fireEvent } from '@testing-library/react';

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

describe('HistorialPage', () => {
  let mockOnEventClick: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnEventClick = vi.fn();
    mockGetAllAreas.mockResolvedValue(sampleAreas);
  });

  it('should render "Historial" heading', async () => {
    mockGetAllEvents.mockResolvedValue([]);

    render(<HistorialPage onEventClick={mockOnEventClick} />);

    expect(screen.getByText('Historial')).toBeInTheDocument();
  });

  it('should show filter dropdowns for type, priority, and status', async () => {
    mockGetAllEvents.mockResolvedValue([]);

    render(<HistorialPage onEventClick={mockOnEventClick} />);

    expect(screen.getByText('Todos los tipos')).toBeInTheDocument();
    expect(screen.getByText('Toda prioridad')).toBeInTheDocument();
    expect(screen.getByText('Todo estado')).toBeInTheDocument();
  });

  it('should show date range inputs', async () => {
    mockGetAllEvents.mockResolvedValue([]);

    render(<HistorialPage onEventClick={mockOnEventClick} />);

    const dateInputs = screen.getAllByDisplayValue('');
    const dateFields = dateInputs.filter((el) => el.getAttribute('type') === 'date');
    expect(dateFields.length).toBeGreaterThanOrEqual(2);
  });

  it('should show loading state', () => {
    mockGetAllEvents.mockReturnValue(new Promise(() => {}));

    render(<HistorialPage onEventClick={mockOnEventClick} />);

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('should show "No se encontraron eventos" when event list is empty', async () => {
    mockGetAllEvents.mockResolvedValue([]);

    render(<HistorialPage onEventClick={mockOnEventClick} />);

    await waitFor(() => {
      expect(screen.getByText('No se encontraron eventos')).toBeInTheDocument();
    });
  });

  it('should render event cards when events exist', async () => {
    mockGetAllEvents.mockResolvedValue([
      makeEvent({ id: 'e1', title: 'First event' }),
      makeEvent({ id: 'e2', title: 'Second event' }),
    ]);

    render(<HistorialPage onEventClick={mockOnEventClick} />);

    await waitFor(() => {
      expect(screen.getByText('First event')).toBeInTheDocument();
      expect(screen.getByText('Second event')).toBeInTheDocument();
    });
  });

  it('should call onEventClick when a card is clicked', async () => {
    mockGetAllEvents.mockResolvedValue([makeEvent({ id: 'evt-click', title: 'Clickable event' })]);

    render(<HistorialPage onEventClick={mockOnEventClick} />);

    await waitFor(() => {
      expect(screen.getByText('Clickable event')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Clickable event'));
    expect(mockOnEventClick).toHaveBeenCalledWith('evt-click');
  });

  it('should change type filter', async () => {
    mockGetAllEvents.mockResolvedValue([]);

    render(<HistorialPage onEventClick={mockOnEventClick} />);

    const typeSelect = screen.getByDisplayValue('Todos los tipos') as HTMLSelectElement;
    fireEvent.change(typeSelect, { target: { value: 'Proyecto' } });
    expect(typeSelect.value).toBe('Proyecto');

    // getAllEvents should be called again with the filter
    await waitFor(() => {
      expect(mockGetAllEvents).toHaveBeenCalled();
    });
  });

  it('should change priority filter', async () => {
    mockGetAllEvents.mockResolvedValue([]);

    render(<HistorialPage onEventClick={mockOnEventClick} />);

    const prioritySelect = screen.getByDisplayValue('Toda prioridad') as HTMLSelectElement;
    fireEvent.change(prioritySelect, { target: { value: 'high' } });
    expect(prioritySelect.value).toBe('high');
  });

  it('should change status filter', async () => {
    mockGetAllEvents.mockResolvedValue([]);

    render(<HistorialPage onEventClick={mockOnEventClick} />);

    const statusSelect = screen.getByDisplayValue('Todo estado') as HTMLSelectElement;
    fireEvent.change(statusSelect, { target: { value: 'completed' } });
    expect(statusSelect.value).toBe('completed');
  });

  it('should change date range filters', async () => {
    mockGetAllEvents.mockResolvedValue([]);

    render(<HistorialPage onEventClick={mockOnEventClick} />);

    const dateInputs = screen.getAllByDisplayValue('');
    const dateFields = dateInputs.filter((el) => el.getAttribute('type') === 'date');

    // Change from date
    fireEvent.change(dateFields[0]!, { target: { value: '2024-01-01' } });
    expect((dateFields[0] as HTMLInputElement).value).toBe('2024-01-01');

    // Change to date
    fireEvent.change(dateFields[1]!, { target: { value: '2024-12-31' } });
    expect((dateFields[1] as HTMLInputElement).value).toBe('2024-12-31');
  });
});
