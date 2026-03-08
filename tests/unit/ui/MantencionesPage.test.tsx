import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MantencionesPage } from '../../../src/ui/pages/MantencionesPage';
import type { MaintenanceSchedule, HomeArea } from '../../../src/domain/models';

vi.mock('../../../src/infra/store-provider', () => ({
  getAllSchedules: vi.fn(),
  getAreaById: vi.fn(),
}));

import { getAllSchedules, getAreaById } from '../../../src/infra/store-provider';

const mockGetAllSchedules = vi.mocked(getAllSchedules);
const mockGetAreaById = vi.mocked(getAreaById);

function makeSchedule(overrides: Partial<MaintenanceSchedule> = {}): MaintenanceSchedule {
  return {
    id: 'sched-1',
    areaId: 'area-1',
    title: 'Clean filters',
    description: 'Replace HVAC filters',
    frequencyDays: 90,
    nextDueDate: '2025-09-01',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

const sampleArea: HomeArea = {
  id: 'area-1',
  name: 'Cocina',
  createdAt: '2024-01-01T00:00:00Z',
};

describe('MantencionesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAreaById.mockResolvedValue(sampleArea);
  });

  it('should show loading state initially', () => {
    mockGetAllSchedules.mockReturnValue(new Promise(() => {}));

    render(<MantencionesPage />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('should show "Mantenciones" heading', async () => {
    mockGetAllSchedules.mockResolvedValue([makeSchedule()]);

    render(<MantencionesPage />);

    await waitFor(() => {
      expect(screen.getByText('Mantenciones')).toBeInTheDocument();
    });
  });

  it('should show empty state when no schedules exist', async () => {
    mockGetAllSchedules.mockResolvedValue([]);

    render(<MantencionesPage />);

    await waitFor(() => {
      expect(screen.getByText('No hay mantenciones programadas')).toBeInTheDocument();
    });
  });

  it('should render schedules when data exists', async () => {
    mockGetAllSchedules.mockResolvedValue([
      makeSchedule({ id: 's1', title: 'Clean filters' }),
      makeSchedule({ id: 's2', title: 'Check plumbing', areaId: 'area-1' }),
    ]);

    render(<MantencionesPage />);

    await waitFor(() => {
      expect(screen.getByText('Clean filters')).toBeInTheDocument();
      expect(screen.getByText('Check plumbing')).toBeInTheDocument();
    });
  });

  it('should show "Vencida" badge for overdue schedules', async () => {
    // Use a past date to trigger overdue
    mockGetAllSchedules.mockResolvedValue([
      makeSchedule({ id: 's-overdue', title: 'Overdue task', nextDueDate: '2020-01-01' }),
    ]);

    render(<MantencionesPage />);

    await waitFor(() => {
      expect(screen.getByText('Vencida')).toBeInTheDocument();
    });
  });

  it('should NOT show "Vencida" badge for future schedules', async () => {
    mockGetAllSchedules.mockResolvedValue([
      makeSchedule({ id: 's-future', title: 'Future task', nextDueDate: '2099-12-31' }),
    ]);

    render(<MantencionesPage />);

    await waitFor(() => {
      expect(screen.getByText('Future task')).toBeInTheDocument();
    });

    expect(screen.queryByText('Vencida')).not.toBeInTheDocument();
  });

  it('should show area name, next due date, and frequency', async () => {
    mockGetAllSchedules.mockResolvedValue([
      makeSchedule({
        id: 's1',
        title: 'Test schedule',
        frequencyDays: 30,
        nextDueDate: '2025-07-15',
      }),
    ]);

    render(<MantencionesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test schedule')).toBeInTheDocument();
    });

    // Area name
    expect(screen.getByText(/Cocina/)).toBeInTheDocument();
    // Next due date
    expect(screen.getByText(/2025-07-15/)).toBeInTheDocument();
    // Frequency
    expect(screen.getByText(/Cada 30 días/)).toBeInTheDocument();
  });

  it('should show schedule description when present', async () => {
    mockGetAllSchedules.mockResolvedValue([
      makeSchedule({ id: 's1', title: 'With desc', description: 'Important maintenance' }),
    ]);

    render(<MantencionesPage />);

    await waitFor(() => {
      expect(screen.getByText('Important maintenance')).toBeInTheDocument();
    });
  });
});
