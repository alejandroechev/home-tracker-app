import { useState, useEffect, useMemo, useCallback } from 'react';
import type { HomeArea, EventType, Priority, EventStatus } from '../../domain/models';
import type { HomeEventFilters } from '../../domain/services';
import { EVENT_TYPES, PRIORITIES, EVENT_STATUSES } from '../../domain/models';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard';
import { getAllAreas } from '../../infra/store-provider';

const statusLabels: Record<EventStatus, string> = {
  not_started: 'Sin iniciar',
  in_progress: 'En progreso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

const priorityLabels: Record<Priority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
};

interface HistorialPageProps {
  onEventClick: (eventId: string) => void;
}

export function HistorialPage({ onEventClick }: HistorialPageProps) {
  const [typeFilter, setTypeFilter] = useState<EventType | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [areaMap, setAreaMap] = useState<Record<string, string>>({});

  const filters: HomeEventFilters = useMemo(() => ({
    ...(typeFilter ? { type: typeFilter } : {}),
    ...(priorityFilter ? { priority: priorityFilter } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(fromDate ? { fromDate } : {}),
    ...(toDate ? { toDate } : {}),
  }), [typeFilter, priorityFilter, statusFilter, fromDate, toDate]);

  const { events, loading } = useEvents(filters);

  const loadAreas = useCallback(async () => {
    const areas = await getAllAreas();
    const map: Record<string, string> = {};
    areas.forEach((a: HomeArea) => { map[a.id] = a.name; });
    setAreaMap(map);
  }, []);

  useEffect(() => {
    void loadAreas();
  }, [loadAreas]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Historial</h2>

      <div className="grid grid-cols-2 gap-2">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as EventType | '')}
          className="border border-gray-300 rounded px-2 py-1.5 text-sm"
        >
          <option value="">Todos los tipos</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as Priority | '')}
          className="border border-gray-300 rounded px-2 py-1.5 text-sm"
        >
          <option value="">Toda prioridad</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{priorityLabels[p]}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as EventStatus | '')}
          className="border border-gray-300 rounded px-2 py-1.5 text-sm"
        >
          <option value="">Todo estado</option>
          {EVENT_STATUSES.map((s) => (
            <option key={s} value={s}>{statusLabels[s]}</option>
          ))}
        </select>

        <div />

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          placeholder="Desde"
          className="border border-gray-300 rounded px-2 py-1.5 text-sm"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          placeholder="Hasta"
          className="border border-gray-300 rounded px-2 py-1.5 text-sm"
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-4">Cargando...</p>
      ) : events.length === 0 ? (
        <p className="text-center text-gray-500 py-4">No se encontraron eventos</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              areaName={areaMap[event.areaId]}
              onClick={() => onEventClick(event.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
