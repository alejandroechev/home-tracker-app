import type { HomeEvent } from '../../domain/models';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

interface EventCardProps {
  event: HomeEvent;
  areaName?: string;
  onClick?: () => void;
}

export function EventCard({ event, areaName, onClick }: EventCardProps) {
  const hasCosts =
    event.materialsCost !== undefined ||
    event.laborCost !== undefined ||
    event.totalCost !== undefined;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-lg shadow-sm border border-gray-200 p-4 active:bg-gray-50"
      type="button"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 text-sm">{event.title}</h3>
        <span className="text-xs text-gray-500 shrink-0 ml-2">{event.date}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs text-gray-500">{event.type}</span>
        {areaName && (
          <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
            {areaName}
          </span>
        )}
        <StatusBadge status={event.status} />
        <PriorityBadge priority={event.priority} />
      </div>
      {hasCosts && (
        <div className="text-xs text-gray-500">
          {event.totalCost !== undefined && <span>Total: ${event.totalCost.toLocaleString()}</span>}
          {event.totalCost === undefined && event.materialsCost !== undefined && (
            <span>Materiales: ${event.materialsCost.toLocaleString()}</span>
          )}
        </div>
      )}
    </button>
  );
}
