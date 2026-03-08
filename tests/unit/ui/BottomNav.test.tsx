import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottomNav } from '../../../src/ui/components/BottomNav';

describe('BottomNav', () => {
  it('renders all 4 tabs', () => {
    render(<BottomNav currentPage="inicio" onNavigate={vi.fn()} />);
    expect(screen.getByLabelText('Inicio')).toBeInTheDocument();
    expect(screen.getByLabelText('Nuevo')).toBeInTheDocument();
    expect(screen.getByLabelText('Mantenciones')).toBeInTheDocument();
    expect(screen.getByLabelText('Historial')).toBeInTheDocument();
  });

  it('highlights active tab with blue text', () => {
    render(<BottomNav currentPage="historial" onNavigate={vi.fn()} />);
    const historialTab = screen.getByLabelText('Historial');
    expect(historialTab.className).toContain('text-blue-600');
    const inicioTab = screen.getByLabelText('Inicio');
    expect(inicioTab.className).toContain('text-gray-500');
  });

  it('calls onNavigate when a tab is clicked', async () => {
    const onNavigate = vi.fn();
    render(<BottomNav currentPage="inicio" onNavigate={onNavigate} />);
    await userEvent.click(screen.getByLabelText('Nuevo'));
    expect(onNavigate).toHaveBeenCalledWith('nuevo-evento');
  });
});
