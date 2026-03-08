import { useState, useCallback } from 'react';

export type Page = 'inicio' | 'nuevo-evento' | 'detalle-evento' | 'historial' | 'mantenciones';

export interface NavigationParams {
  eventId?: string;
}

interface NavigationState {
  page: Page;
  params: NavigationParams;
}

export function useNavigation() {
  const [history, setHistory] = useState<NavigationState[]>([
    { page: 'inicio', params: {} },
  ]);

  const current = history[history.length - 1]!;

  const navigateTo = useCallback((page: Page, params: NavigationParams = {}) => {
    setHistory((prev) => [...prev, { page, params }]);
  }, []);

  const goBack = useCallback(() => {
    setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  return {
    currentPage: current.page,
    params: current.params,
    navigateTo,
    goBack,
  };
}
