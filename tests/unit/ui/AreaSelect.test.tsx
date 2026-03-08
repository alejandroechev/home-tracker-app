import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AreaSelect } from '../../../src/ui/components/AreaSelect';
import type { HomeArea } from '../../../src/domain/models';

vi.mock('../../../src/infra/store-provider', () => ({
  getAllAreas: vi.fn(),
  createArea: vi.fn(),
}));

import { getAllAreas, createArea } from '../../../src/infra/store-provider';

const mockGetAllAreas = vi.mocked(getAllAreas);
const mockCreateArea = vi.mocked(createArea);

const sampleAreas: HomeArea[] = [
  { id: 'area-1', name: 'Cocina', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'area-2', name: 'Baño', createdAt: '2024-01-01T00:00:00Z' },
];

describe('AreaSelect', () => {
  let mockOnChange: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnChange = vi.fn();
    mockGetAllAreas.mockResolvedValue(sampleAreas);
  });

  it('should render select with "Seleccionar área..." placeholder', async () => {
    render(<AreaSelect value="" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText('Seleccionar área...')).toBeInTheDocument();
    });
  });

  it('should load and display areas from store', async () => {
    render(<AreaSelect value="" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText('Cocina')).toBeInTheDocument();
      expect(screen.getByText('Baño')).toBeInTheDocument();
    });
  });

  it('should show "Crear nueva área..." option', async () => {
    render(<AreaSelect value="" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText('Crear nueva área...')).toBeInTheDocument();
    });
  });

  it('should call onChange when an area is selected', async () => {
    render(<AreaSelect value="" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText('Cocina')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'area-1' } });
    expect(mockOnChange).toHaveBeenCalledWith('area-1');
  });

  it('should switch to create mode when "Crear nueva área..." is selected', async () => {
    render(<AreaSelect value="" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText('Crear nueva área...')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '__create__' } });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nombre del área')).toBeInTheDocument();
      expect(screen.getByText('Crear')).toBeInTheDocument();
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });
  });

  it('should show input field and Crear/Cancelar buttons in create mode', async () => {
    render(<AreaSelect value="" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText('Crear nueva área...')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '__create__' } });

    expect(screen.getByPlaceholderText('Nombre del área')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('should create area and call onChange with new area id', async () => {
    const newArea: HomeArea = { id: 'area-new', name: 'Jardín', createdAt: '2024-01-02T00:00:00Z' };
    mockCreateArea.mockResolvedValue(newArea);

    render(<AreaSelect value="" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText('Crear nueva área...')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '__create__' } });

    fireEvent.change(screen.getByPlaceholderText('Nombre del área'), { target: { value: 'Jardín' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }));

    await waitFor(() => {
      expect(mockCreateArea).toHaveBeenCalledWith({ name: 'Jardín' });
      expect(mockOnChange).toHaveBeenCalledWith('area-new');
    });

    // Should return to select mode and show new area
    await waitFor(() => {
      expect(screen.getByText('Jardín')).toBeInTheDocument();
    });
  });

  it('should show error when creating area with empty name', async () => {
    render(<AreaSelect value="" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText('Crear nueva área...')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '__create__' } });

    // Leave name empty and click Crear
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }));

    await waitFor(() => {
      expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
    });
    expect(mockCreateArea).not.toHaveBeenCalled();
  });

  it('should show error when createArea throws an Error', async () => {
    mockCreateArea.mockRejectedValue(new Error('Duplicate area'));

    render(<AreaSelect value="" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText('Crear nueva área...')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '__create__' } });
    fireEvent.change(screen.getByPlaceholderText('Nombre del área'), { target: { value: 'Cocina' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }));

    await waitFor(() => {
      expect(screen.getByText('Duplicate area')).toBeInTheDocument();
    });
  });

  it('should show generic error when createArea throws non-Error', async () => {
    mockCreateArea.mockRejectedValue('unknown error');

    render(<AreaSelect value="" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText('Crear nueva área...')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '__create__' } });
    fireEvent.change(screen.getByPlaceholderText('Nombre del área'), { target: { value: 'Test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }));

    await waitFor(() => {
      expect(screen.getByText('Error al crear área')).toBeInTheDocument();
    });
  });

  it('should return to select mode when Cancelar is clicked', async () => {
    render(<AreaSelect value="" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText('Crear nueva área...')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '__create__' } });
    expect(screen.getByPlaceholderText('Nombre del área')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => {
      expect(screen.getByText('Seleccionar área...')).toBeInTheDocument();
    });
  });

  it('should display the error prop', async () => {
    render(<AreaSelect value="" onChange={mockOnChange} error="El área es requerida" />);

    await waitFor(() => {
      expect(screen.getByText('El área es requerida')).toBeInTheDocument();
    });
  });
});
