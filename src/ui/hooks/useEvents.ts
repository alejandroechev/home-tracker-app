import { useState, useEffect, useCallback } from 'react';
import type { HomeEvent } from '../../domain/models';
import type { HomeEventFilters } from '../../domain/services';
import { getAllEvents } from '../../infra/store-provider';

export function useEvents(filters?: HomeEventFilters) {
  const [events, setEvents] = useState<HomeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllEvents(filters);
      setEvents(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return { events, loading, error, refetch: fetch };
}
