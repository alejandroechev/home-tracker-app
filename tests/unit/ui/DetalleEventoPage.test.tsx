import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DetalleEventoPage } from '../../../src/ui/pages/DetalleEventoPage';
import type { HomeEvent, HomeArea } from '../../../src/domain/models';

vi.mock('../../../src/infra/store-provider', () => ({
  getEventById: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
  getAreaById: vi.fn(),
}));

vi.mock('../../../src/ui/components/StatusBadge', () => ({
  StatusBadge: ({ status }: { status: string }) => <span data-testid="status-badge">{status}</span>,
}));

vi.mock('../../../src/ui/components/PriorityBadge', () => ({
  PriorityBadge: ({ priority }: { priority: string }) => <span data-testid="priority-badge">{priority}</span>,
}));

import { getEventById, updateEvent, deleteEvent, getAreaById } from '../../../src/infra/store-provider';

const mockGetEventById = vi.mocked(getEventById);
const mockUpdateEvent = vi.mocked(updateEvent);
const mockDeleteEvent = vi.mocked(deleteEvent);
const mockGetAreaById = vi.mocked(getAreaById);

const sampleEvent: HomeEvent = {
  id: 'evt-1',
  date: '2024-06-01',
  type: 'Reparación',
  title: 'Fix faucet',
  description: 'Leaky kitchen faucet',
  areaId: 'area-1',
  priority: 'high',
  status: 'not_started',
  materialsCost: 5000,
  laborCost: 10000,
  totalCost: 15000,
  vendorName: 'Plumber Joe',
  createdAt: '2024-06-01T00:00:00Z',
  updatedAt: '2024-06-01T00:00:00Z',
};

const sampleArea: HomeArea = {
  id: 'area-1',
  name: 'Cocina',
  createdAt: '2024-01-01T00:00:00Z',
};

describe('DetalleEventoPage', () => {
  let mockOnBack: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnBack = vi.fn();
    mockGetEventById.mockResolvedValue(sampleEvent);
    mockGetAreaById.mockResolvedValue(sampleArea);
  });

  it('should show loading state initially', () => {
    mockGetEventById.mockReturnValue(new Promise(() => {}));
    render(<DetalleEventoPage eventId="evt-1" onBack={mockOnBack} />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('should show "Evento no encontrado" when event does not exist', async () => {
    mockGetEventById.mockResolvedValue(null);
    render(<DetalleEventoPage eventId="nonexistent" onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText('Evento no encontrado')).toBeInTheDocument();
    });
  });

  it('should render event details', async () => {
    render(<DetalleEventoPage eventId="evt-1" onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText('Fix faucet')).toBeInTheDocument();
    });

    expect(screen.getByText('Leaky kitchen faucet')).toBeInTheDocument();
    expect(screen.getByText('2024-06-01')).toBeInTheDocument();
    expect(screen.getByText('Reparación')).toBeInTheDocument();
    expect(screen.getByText('Cocina')).toBeInTheDocument();

    // Status and priority badges (mocked)
    expect(screen.getByTestId('status-badge')).toHaveTextContent('not_started');
    expect(screen.getByTestId('priority-badge')).toHaveTextContent('high');
  });

  it('should show cost section', async () => {
    render(<DetalleEventoPage eventId="evt-1" onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText('Costos')).toBeInTheDocument();
    });

    expect(screen.getByText('Materiales')).toBeInTheDocument();
    expect(screen.getByText('Mano de obra')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Proveedor')).toBeInTheDocument();
    expect(screen.getByText('Plumber Joe')).toBeInTheDocument();
  });

  it('should enter edit mode when a field is clicked', async () => {
    render(<DetalleEventoPage eventId="evt-1" onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText('Fix faucet')).toBeInTheDocument();
    });

    // Click on the title field button
    const titleButton = screen.getByText('Fix faucet').closest('button');
    fireEvent.click(titleButton!);

    // Should show an input with current value
    await waitFor(() => {
      const input = screen.getByDisplayValue('Fix faucet');
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });
  });

  it('should call updateEvent when saving an edit', async () => {
    const updatedEvent = { ...sampleEvent, title: 'Fixed faucet' };
    mockUpdateEvent.mockResolvedValue(updatedEvent);

    render(<DetalleEventoPage eventId="evt-1" onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText('Fix faucet')).toBeInTheDocument();
    });

    // Click to edit title
    const titleButton = screen.getByText('Fix faucet').closest('button');
    fireEvent.click(titleButton!);

    const input = screen.getByDisplayValue('Fix faucet');
    fireEvent.change(input, { target: { value: 'Fixed faucet' } });

    // Click save (✓ button)
    const saveButton = screen.getByText('✓');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateEvent).toHaveBeenCalledWith('evt-1', { title: 'Fixed faucet' });
    });
  });

  it('should cancel edit when cancel button is clicked', async () => {
    render(<DetalleEventoPage eventId="evt-1" onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText('Fix faucet')).toBeInTheDocument();
    });

    // Click to edit title
    const titleButton = screen.getByText('Fix faucet').closest('button');
    fireEvent.click(titleButton!);

    expect(screen.getByDisplayValue('Fix faucet')).toBeInTheDocument();

    // Click cancel (✕ button)
    const cancelButton = screen.getByText('✕');
    fireEvent.click(cancelButton);

    // Should return to display mode
    await waitFor(() => {
      expect(screen.queryByDisplayValue('Fix faucet')).not.toBeInTheDocument();
      expect(screen.getByText('Fix faucet')).toBeInTheDocument();
    });
  });

  it('should show delete confirmation when delete button is clicked', async () => {
    render(<DetalleEventoPage eventId="evt-1" onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText('Eliminar evento')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Eliminar evento'));

    expect(screen.getByText('Confirmar eliminación')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('should call deleteEvent and onBack when deletion is confirmed', async () => {
    mockDeleteEvent.mockResolvedValue(undefined);

    render(<DetalleEventoPage eventId="evt-1" onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText('Eliminar evento')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Eliminar evento'));
    fireEvent.click(screen.getByText('Confirmar eliminación'));

    await waitFor(() => {
      expect(mockDeleteEvent).toHaveBeenCalledWith('evt-1');
      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  it('should hide confirmation when cancel delete is clicked', async () => {
    render(<DetalleEventoPage eventId="evt-1" onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText('Eliminar evento')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Eliminar evento'));
    expect(screen.getByText('Confirmar eliminación')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancelar'));

    await waitFor(() => {
      expect(screen.queryByText('Confirmar eliminación')).not.toBeInTheDocument();
      expect(screen.getByText('Eliminar evento')).toBeInTheDocument();
    });
  });

  it('should enter edit mode for status select field and save', async () => {
    const updatedEvent = { ...sampleEvent, status: 'in_progress' as const };
    mockUpdateEvent.mockResolvedValue(updatedEvent);

    render(<DetalleEventoPage eventId="evt-1" onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByTestId('status-badge')).toBeInTheDocument();
    });

    const statusBadge = screen.getByTestId('status-badge');
    const statusButton = statusBadge.closest('button');
    fireEvent.click(statusButton!);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      const statusSelect = selects.find(s => (s as HTMLSelectElement).value === 'not_started');
      expect(statusSelect).toBeTruthy();
    });

    const selects = screen.getAllByRole('combobox');
    const statusSelect = selects.find(s => (s as HTMLSelectElement).value === 'not_started')!;
    fireEvent.change(statusSelect, { target: { value: 'in_progress' } });
    fireEvent.click(screen.getByText('✓'));

    await waitFor(() => {
      expect(mockUpdateEvent).toHaveBeenCalledWith('evt-1', { status: 'in_progress' });
    });
  });

  it('should enter edit mode for priority select field and cancel', async () => {
    render(<DetalleEventoPage eventId="evt-1" onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByTestId('priority-badge')).toBeInTheDocument();
    });

    const priorityBadge = screen.getByTestId('priority-badge');
    const priorityButton = priorityBadge.closest('button');
    fireEvent.click(priorityButton!);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      const prioritySelect = selects.find(s => (s as HTMLSelectElement).value === 'high');
      expect(prioritySelect).toBeTruthy();
    });

    fireEvent.click(screen.getByText('✕'));

    await waitFor(() => {
      expect(screen.getByTestId('priority-badge')).toBeInTheDocument();
    });
  });

  it('should enter edit mode for type field and save', async () => {
    const updatedEvent = { ...sampleEvent, type: 'Proyecto' as const };
    mockUpdateEvent.mockResolvedValue(updatedEvent);

    render(<DetalleEventoPage eventId="evt-1" onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText('Reparación')).toBeInTheDocument();
    });

    const typeText = screen.getByText('Reparación');
    const typeButton = typeText.closest('button');
    fireEvent.click(typeButton!);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      const typeSelect = selects.find(s => (s as HTMLSelectElement).value === 'Reparación');
      expect(typeSelect).toBeTruthy();
    });

    const selects2 = screen.getAllByRole('combobox');
    const typeSelect = selects2.find(s => (s as HTMLSelectElement).value === 'Reparación')!;
    fireEvent.change(typeSelect, { target: { value: 'Proyecto' } });
    fireEvent.click(screen.getByText('✓'));

    await waitFor(() => {
      expect(mockUpdateEvent).toHaveBeenCalledWith('evt-1', { type: 'Proyecto' });
    });
  });

  it('should cancel type edit when cancel button clicked', async () => {
    render(<DetalleEventoPage eventId="evt-1" onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText('Reparación')).toBeInTheDocument();
    });

    const typeText = screen.getByText('Reparación');
    const typeButton = typeText.closest('button');
    fireEvent.click(typeButton!);

    await waitFor(() => {
      expect(screen.getByText('✕')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('✕'));

    await waitFor(() => {
      expect(screen.getByText('Reparación')).toBeInTheDocument();
    });
  });

  it('should enter edit mode for cost field and save', async () => {
    const updatedEvent = { ...sampleEvent, materialsCost: 7000 };
    mockUpdateEvent.mockResolvedValue(updatedEvent);

    render(<DetalleEventoPage eventId="evt-1" onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText('Costos')).toBeInTheDocument();
    });

    const materialesLabel = screen.getByText('Materiales');
    const materialesButton = materialesLabel.closest('button');
    fireEvent.click(materialesButton!);

    await waitFor(() => {
      const input = screen.getByDisplayValue('5000');
      expect(input).toBeInTheDocument();
    });

    const input = screen.getByDisplayValue('5000');
    fireEvent.change(input, { target: { value: '7000' } });
    fireEvent.click(screen.getByText('✓'));

    await waitFor(() => {
      expect(mockUpdateEvent).toHaveBeenCalledWith('evt-1', { materialsCost: 7000 });
    });
  });

  it('should enter edit mode for cost field with empty value and save 0', async () => {
    const eventNoCost = { ...sampleEvent, materialsCost: undefined, laborCost: undefined, totalCost: undefined };
    mockGetEventById.mockResolvedValue(eventNoCost);
    const updatedEvent = { ...eventNoCost, materialsCost: 0 };
    mockUpdateEvent.mockResolvedValue(updatedEvent);

    render(<DetalleEventoPage eventId="evt-1" onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText('Costos')).toBeInTheDocument();
    });

    const materialesLabel = screen.getByText('Materiales');
    const materialesButton = materialesLabel.closest('button');
    fireEvent.click(materialesButton!);

    await waitFor(() => {
      const input = screen.getByDisplayValue('');
      expect(input).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('✓'));

    await waitFor(() => {
      expect(mockUpdateEvent).toHaveBeenCalledWith('evt-1', { materialsCost: 0 });
    });
  });

  it('should edit the date field (date input type)', async () => {
    const updatedEvent = { ...sampleEvent, date: '2025-01-15' };
    mockUpdateEvent.mockResolvedValue(updatedEvent);

    render(<DetalleEventoPage eventId="evt-1" onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText('2024-06-01')).toBeInTheDocument();
    });

    const dateText = screen.getByText('2024-06-01');
    const dateButton = dateText.closest('button');
    fireEvent.click(dateButton!);

    await waitFor(() => {
      const dateInput = screen.getByDisplayValue('2024-06-01');
      expect(dateInput.getAttribute('type')).toBe('date');
    });

    const dateInput = screen.getByDisplayValue('2024-06-01');
    fireEvent.change(dateInput, { target: { value: '2025-01-15' } });
    fireEvent.click(screen.getByText('✓'));

    await waitFor(() => {
      expect(mockUpdateEvent).toHaveBeenCalledWith('evt-1', { date: '2025-01-15' });
    });
  });

  it('should render event without area name when area not found', async () => {
    mockGetAreaById.mockResolvedValue(null);

    render(<DetalleEventoPage eventId="evt-1" onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText('Desconocida')).toBeInTheDocument();
    });
  });
});
