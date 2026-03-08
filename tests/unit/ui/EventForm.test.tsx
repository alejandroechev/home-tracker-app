import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventForm } from '../../../src/ui/components/EventForm';

vi.mock('../../../src/ui/components/AreaSelect', () => ({
  AreaSelect: ({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) => (
    <div>
      <select data-testid="area-select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select area</option>
        <option value="area-1">Area 1</option>
      </select>
      {error && <p>{error}</p>}
    </div>
  ),
}));

describe('EventForm', () => {
  let mockOnSubmit: Mock;

  beforeEach(() => {
    mockOnSubmit = vi.fn().mockResolvedValue(undefined);
  });

  it('should render all form fields', () => {
    render(<EventForm onSubmit={mockOnSubmit} />);

    // Date input
    expect(screen.getByText('Fecha')).toBeInTheDocument();
    // Type select
    expect(screen.getByText('Tipo')).toBeInTheDocument();
    // Title input
    expect(screen.getByPlaceholderText('Describe brevemente el evento')).toBeInTheDocument();
    // Description textarea
    expect(screen.getByPlaceholderText('Detalles adicionales...')).toBeInTheDocument();
    // Area select (mocked)
    expect(screen.getByTestId('area-select')).toBeInTheDocument();
    // Priority select
    expect(screen.getByText('Prioridad')).toBeInTheDocument();
  });

  it('should render submit button with "Guardar Evento"', () => {
    render(<EventForm onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('button', { name: 'Guardar Evento' })).toBeInTheDocument();
  });

  it('should show validation errors when submitting with empty title', async () => {
    render(<EventForm onSubmit={mockOnSubmit} />);

    // Fill in area so only title is missing
    fireEvent.change(screen.getByTestId('area-select'), { target: { value: 'area-1' } });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar Evento' }));

    await waitFor(() => {
      expect(screen.getByText('El título es requerido')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should call onSubmit with valid data', async () => {
    render(<EventForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('Describe brevemente el evento'), { target: { value: 'Fix pipe' } });
    fireEvent.change(screen.getByPlaceholderText('Detalles adicionales...'), { target: { value: 'Kitchen pipe' } });
    fireEvent.change(screen.getByTestId('area-select'), { target: { value: 'area-1' } });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar Evento' }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    const call = mockOnSubmit.mock.calls[0]![0];
    expect(call.title).toBe('Fix pipe');
    expect(call.description).toBe('Kitchen pipe');
    expect(call.areaId).toBe('area-1');
    expect(call.type).toBe('Reparación');
    expect(call.priority).toBe('medium');
  });

  it('should show "Guardando..." when submitting', async () => {
    // Make onSubmit hang to see submitting state
    let resolveSubmit: () => void;
    const pendingPromise = new Promise<void>((resolve) => { resolveSubmit = resolve; });
    mockOnSubmit.mockReturnValue(pendingPromise);

    render(<EventForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('Describe brevemente el evento'), { target: { value: 'Test event' } });
    fireEvent.change(screen.getByTestId('area-select'), { target: { value: 'area-1' } });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar Evento' }));

    await waitFor(() => {
      expect(screen.getByText('Guardando...')).toBeInTheDocument();
    });

    // Resolve to clean up
    resolveSubmit!();
    await waitFor(() => {
      expect(screen.getByText('Guardar Evento')).toBeInTheDocument();
    });
  });

  it('should show form error when onSubmit throws', async () => {
    mockOnSubmit.mockRejectedValue(new Error('Server error'));

    render(<EventForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('Describe brevemente el evento'), { target: { value: 'Test event' } });
    fireEvent.change(screen.getByTestId('area-select'), { target: { value: 'area-1' } });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar Evento' }));

    await waitFor(() => {
      expect(screen.getByText('Error al guardar el evento')).toBeInTheDocument();
    });
  });

  it('should NOT call onSubmit when validation fails', async () => {
    render(<EventForm onSubmit={mockOnSubmit} />);

    // Submit with empty title and no area
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Evento' }));

    await waitFor(() => {
      expect(screen.getByText('El título es requerido')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should allow changing date field', () => {
    render(<EventForm onSubmit={mockOnSubmit} />);
    // Date input is the only input[type="date"] in the form
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2025-01-15' } });
    expect(dateInput.value).toBe('2025-01-15');
  });

  it('should allow changing type select', () => {
    render(<EventForm onSubmit={mockOnSubmit} />);
    // Type select is the first native select (AreaSelect is mocked, priority is second)
    const selects = document.querySelectorAll('select:not([data-testid])');
    const typeSelect = selects[0] as HTMLSelectElement;
    fireEvent.change(typeSelect, { target: { value: 'Proyecto' } });
    expect(typeSelect.value).toBe('Proyecto');
  });

  it('should allow changing priority select', () => {
    render(<EventForm onSubmit={mockOnSubmit} />);
    // Priority select contains the Baja/Media/Alta/Urgente options
    const selects = document.querySelectorAll('select:not([data-testid])');
    const prioritySelect = selects[1] as HTMLSelectElement;
    fireEvent.change(prioritySelect, { target: { value: 'urgent' } });
    expect(prioritySelect.value).toBe('urgent');
  });

  it('should allow filling cost and vendor fields and submit them', async () => {
    render(<EventForm onSubmit={mockOnSubmit} />);

    // Fill required fields first
    fireEvent.change(screen.getByPlaceholderText('Describe brevemente el evento'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByTestId('area-select'), { target: { value: 'area-1' } });

    // Cost fields are the three input[type="number"]
    const numberInputs = document.querySelectorAll('input[type="number"]');
    const materialsCostInput = numberInputs[0] as HTMLInputElement;
    const laborCostInput = numberInputs[1] as HTMLInputElement;
    const totalCostInput = numberInputs[2] as HTMLInputElement;

    fireEvent.change(materialsCostInput, { target: { value: '5000' } });
    expect(materialsCostInput.value).toBe('5000');

    fireEvent.change(laborCostInput, { target: { value: '10000' } });
    expect(laborCostInput.value).toBe('10000');

    fireEvent.change(totalCostInput, { target: { value: '15000' } });
    expect(totalCostInput.value).toBe('15000');

    const vendorInput = screen.getByPlaceholderText('Nombre del proveedor') as HTMLInputElement;
    fireEvent.change(vendorInput, { target: { value: 'Plumber' } });
    expect(vendorInput.value).toBe('Plumber');

    fireEvent.click(screen.getByRole('button', { name: 'Guardar Evento' }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    const call = mockOnSubmit.mock.calls[0]![0];
    expect(call.materialsCost).toBe(5000);
    expect(call.laborCost).toBe(10000);
    expect(call.totalCost).toBe(15000);
    expect(call.vendorName).toBe('Plumber');
  });
});
