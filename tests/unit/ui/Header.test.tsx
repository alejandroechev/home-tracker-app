import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../../../src/ui/components/Header';

describe('Header', () => {
  it('renders "HomeTracker" title', () => {
    render(<Header currentPage="inicio" onBack={vi.fn()} />);
    expect(screen.getByText('HomeTracker')).toBeInTheDocument();
  });

  it('does not show back button on inicio page', () => {
    render(<Header currentPage="inicio" onBack={vi.fn()} />);
    expect(screen.queryByLabelText('Volver')).not.toBeInTheDocument();
  });

  it('shows back button on other pages', () => {
    render(<Header currentPage="nuevo-evento" onBack={vi.fn()} />);
    expect(screen.getByLabelText('Volver')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', async () => {
    const onBack = vi.fn();
    render(<Header currentPage="detalle-evento" onBack={onBack} />);
    await userEvent.click(screen.getByLabelText('Volver'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
