import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useEvents } from '../../../src/ui/hooks/useEvents';
import type { HomeEvent } from '../../../src/domain/models';

vi.mock('../../../src/infra/store-provider', () => ({
  getAllEvents: vi.fn(),
}));

import { getAllEvents } from '../../../src/infra/store-provider';

const mockGetAllEvents = vi.mocked(getAllEvents);

const sampleEvent: HomeEvent = {
  id: 'evt-1',
  date: '2024-06-01',
  type: 'Reparación',
  title: 'Fix faucet',
  description: 'Leaky faucet in kitchen',
  areaId: 'area-1',
  priority: 'high',
  status: 'not_started',
  createdAt: '2024-06-01T00:00:00Z',
  updatedAt: '2024-06-01T00:00:00Z',
};

describe('useEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start with loading true and then set it to false after fetch', async () => {
    mockGetAllEvents.mockResolvedValue([]);
    const { result } = renderHook(() => useEvents());

    // Initially loading
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should return events from getAllEvents', async () => {
    const events = [sampleEvent, { ...sampleEvent, id: 'evt-2', title: 'Second event' }];
    mockGetAllEvents.mockResolvedValue(events);

    const { result } = renderHook(() => useEvents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.events).toEqual(events);
    expect(result.current.error).toBeNull();
  });

  it('should return error message when getAllEvents throws an Error', async () => {
    mockGetAllEvents.mockRejectedValue(new Error('Database connection failed'));

    const { result } = renderHook(() => useEvents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Database connection failed');
    expect(result.current.events).toEqual([]);
  });

  it('should return generic error string when getAllEvents throws a non-Error', async () => {
    mockGetAllEvents.mockRejectedValue('something went wrong');

    const { result } = renderHook(() => useEvents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Error al cargar eventos');
    expect(result.current.events).toEqual([]);
  });

  it('should re-fetch events when refetch is called', async () => {
    mockGetAllEvents.mockResolvedValue([sampleEvent]);

    const { result } = renderHook(() => useEvents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.events).toHaveLength(1);

    const updatedEvents = [sampleEvent, { ...sampleEvent, id: 'evt-3', title: 'New one' }];
    mockGetAllEvents.mockResolvedValue(updatedEvents);

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.events).toHaveLength(2);
    });
  });

  it('should pass filters to getAllEvents', async () => {
    mockGetAllEvents.mockResolvedValue([]);
    const filters = { type: 'Reparación' as const, priority: 'high' as const };

    const { result } = renderHook(() => useEvents(filters));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetAllEvents).toHaveBeenCalledWith(filters);
  });
});
