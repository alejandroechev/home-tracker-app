import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavigation } from '../../../src/ui/hooks/useNavigation';

describe('useNavigation', () => {
  it('should start on inicio page with empty params', () => {
    const { result } = renderHook(() => useNavigation());
    expect(result.current.currentPage).toBe('inicio');
    expect(result.current.params).toEqual({});
  });

  it('should change currentPage when navigateTo is called', () => {
    const { result } = renderHook(() => useNavigation());
    act(() => {
      result.current.navigateTo('historial');
    });
    expect(result.current.currentPage).toBe('historial');
  });

  it('should preserve params when navigateTo is called with params', () => {
    const { result } = renderHook(() => useNavigation());
    act(() => {
      result.current.navigateTo('detalle-evento', { eventId: 'evt-123' });
    });
    expect(result.current.currentPage).toBe('detalle-evento');
    expect(result.current.params).toEqual({ eventId: 'evt-123' });
  });

  it('should default params to empty object when navigateTo called without params', () => {
    const { result } = renderHook(() => useNavigation());
    act(() => {
      result.current.navigateTo('mantenciones');
    });
    expect(result.current.params).toEqual({});
  });

  it('should go back to previous page when goBack is called', () => {
    const { result } = renderHook(() => useNavigation());
    act(() => {
      result.current.navigateTo('historial');
    });
    expect(result.current.currentPage).toBe('historial');

    act(() => {
      result.current.goBack();
    });
    expect(result.current.currentPage).toBe('inicio');
  });

  it('should stay on inicio when goBack is called on initial page', () => {
    const { result } = renderHook(() => useNavigation());
    act(() => {
      result.current.goBack();
    });
    expect(result.current.currentPage).toBe('inicio');
    expect(result.current.params).toEqual({});
  });

  it('should build correct history across multiple navigations', () => {
    const { result } = renderHook(() => useNavigation());
    act(() => {
      result.current.navigateTo('nuevo-evento');
    });
    expect(result.current.currentPage).toBe('nuevo-evento');

    act(() => {
      result.current.navigateTo('detalle-evento', { eventId: 'e1' });
    });
    expect(result.current.currentPage).toBe('detalle-evento');
    expect(result.current.params).toEqual({ eventId: 'e1' });

    act(() => {
      result.current.navigateTo('mantenciones');
    });
    expect(result.current.currentPage).toBe('mantenciones');
  });

  it('should go back correctly after multiple navigations', () => {
    const { result } = renderHook(() => useNavigation());
    act(() => {
      result.current.navigateTo('historial');
    });
    act(() => {
      result.current.navigateTo('detalle-evento', { eventId: 'e2' });
    });
    act(() => {
      result.current.navigateTo('mantenciones');
    });
    expect(result.current.currentPage).toBe('mantenciones');

    act(() => {
      result.current.goBack();
    });
    expect(result.current.currentPage).toBe('detalle-evento');
    expect(result.current.params).toEqual({ eventId: 'e2' });

    act(() => {
      result.current.goBack();
    });
    expect(result.current.currentPage).toBe('historial');

    act(() => {
      result.current.goBack();
    });
    expect(result.current.currentPage).toBe('inicio');

    // Further goBack should stay on inicio
    act(() => {
      result.current.goBack();
    });
    expect(result.current.currentPage).toBe('inicio');
  });
});
