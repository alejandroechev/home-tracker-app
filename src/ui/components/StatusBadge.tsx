import type { EventStatus } from '../../domain/models';

const statusConfig: Record<EventStatus, { label: string; className: string }> = {
  not_started: { label: 'Sin iniciar', className: 'bg-gray-100 text-gray-700' },
  in_progress: { label: 'En progreso', className: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completado', className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
};

interface StatusBadgeProps {
  status: EventStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
