import { useState, useEffect, useCallback } from 'react';
import type { HomeEvent, UpdateHomeEventInput, EventStatus, Priority, EventType } from '../../domain/models';
import { EVENT_TYPES, PRIORITIES, EVENT_STATUSES } from '../../domain/models';
import { getEventById, updateEvent, deleteEvent, getAreaById } from '../../infra/store-provider';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';

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

interface DetalleEventoPageProps {
  eventId: string;
  onBack: () => void;
}

export function DetalleEventoPage({ eventId, onBack }: DetalleEventoPageProps) {
  const [event, setEvent] = useState<HomeEvent | null>(null);
  const [areaName, setAreaName] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const ev = await getEventById(eventId);
    setEvent(ev);
    if (ev) {
      const area = await getAreaById(ev.areaId);
      setAreaName(area?.name ?? 'Desconocida');
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleUpdate = async (field: string, value: string | number) => {
    const input: UpdateHomeEventInput = { [field]: value };
    const updated = await updateEvent(eventId, input);
    setEvent(updated);
    setEditing(null);
  };

  const handleDelete = async () => {
    await deleteEvent(eventId);
    onBack();
  };

  if (loading) {
    return <p className="text-center text-gray-500 py-8">Cargando...</p>;
  }

  if (!event) {
    return <p className="text-center text-gray-500 py-8">Evento no encontrado</p>;
  }

  const renderEditableField = (field: string, label: string, currentValue: string) => {
    if (editing === field) {
      return (
        <div className="flex gap-2 items-center">
          <input
            type={field === 'date' ? 'date' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <button
            onClick={() => void handleUpdate(field, editValue)}
            className="text-blue-600 text-sm font-medium"
          >
            ✓
          </button>
          <button
            onClick={() => setEditing(null)}
            className="text-gray-400 text-sm"
          >
            ✕
          </button>
        </div>
      );
    }
    return (
      <button
        onClick={() => { setEditing(field); setEditValue(currentValue); }}
        className="text-left w-full"
        type="button"
      >
        <span className="text-xs text-gray-500 block">{label}</span>
        <span className="text-sm text-gray-900">{currentValue || '—'}</span>
      </button>
    );
  };

  const renderSelectField = (
    field: string,
    label: string,
    currentValue: string,
    options: readonly string[],
    labels: Record<string, string>,
  ) => {
    if (editing === field) {
      return (
        <div className="flex gap-2 items-center">
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {options.map((o) => (
              <option key={o} value={o}>{labels[o] ?? o}</option>
            ))}
          </select>
          <button
            onClick={() => void handleUpdate(field, editValue)}
            className="text-blue-600 text-sm font-medium"
          >
            ✓
          </button>
          <button
            onClick={() => setEditing(null)}
            className="text-gray-400 text-sm"
          >
            ✕
          </button>
        </div>
      );
    }
    return (
      <button
        onClick={() => { setEditing(field); setEditValue(currentValue); }}
        className="text-left w-full"
        type="button"
      >
        <span className="text-xs text-gray-500 block">{label}</span>
        {field === 'status' && <StatusBadge status={currentValue as EventStatus} />}
        {field === 'priority' && <PriorityBadge priority={currentValue as Priority} />}
        {field !== 'status' && field !== 'priority' && (
          <span className="text-sm text-gray-900">{labels[currentValue] ?? currentValue}</span>
        )}
      </button>
    );
  };

  const renderCostField = (field: string, label: string, currentValue?: number) => {
    if (editing === field) {
      return (
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min="0"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <button
            onClick={() => void handleUpdate(field, editValue ? Number(editValue) : 0)}
            className="text-blue-600 text-sm font-medium"
          >
            ✓
          </button>
          <button
            onClick={() => setEditing(null)}
            className="text-gray-400 text-sm"
          >
            ✕
          </button>
        </div>
      );
    }
    return (
      <button
        onClick={() => { setEditing(field); setEditValue(currentValue?.toString() ?? ''); }}
        className="text-left w-full"
        type="button"
      >
        <span className="text-xs text-gray-500 block">{label}</span>
        <span className="text-sm text-gray-900">
          {currentValue !== undefined ? `$${currentValue.toLocaleString()}` : '—'}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
        {renderEditableField('title', 'Título', event.title)}
        {renderEditableField('description', 'Descripción', event.description)}
        {renderEditableField('date', 'Fecha', event.date)}

        <div>
          <span className="text-xs text-gray-500 block">Tipo</span>
          {editing === 'type' ? (
            <div className="flex gap-2 items-center">
              <select
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button
                onClick={() => void handleUpdate('type', editValue as EventType)}
                className="text-blue-600 text-sm font-medium"
              >
                ✓
              </button>
              <button onClick={() => setEditing(null)} className="text-gray-400 text-sm">✕</button>
            </div>
          ) : (
            <button
              onClick={() => { setEditing('type'); setEditValue(event.type); }}
              className="text-left w-full"
              type="button"
            >
              <span className="text-sm text-gray-900">{event.type}</span>
            </button>
          )}
        </div>

        {renderSelectField('status', 'Estado', event.status, EVENT_STATUSES, statusLabels)}
        {renderSelectField('priority', 'Prioridad', event.priority, PRIORITIES, priorityLabels)}

        <div>
          <span className="text-xs text-gray-500 block">Área</span>
          <span className="text-sm text-gray-900">{areaName}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
        <h3 className="font-semibold text-gray-800 text-sm">Costos</h3>
        {renderCostField('materialsCost', 'Materiales', event.materialsCost)}
        {renderCostField('laborCost', 'Mano de obra', event.laborCost)}
        {renderCostField('totalCost', 'Total', event.totalCost)}
        {renderEditableField('vendorName', 'Proveedor', event.vendorName ?? '')}
      </div>

      <div className="pt-2">
        {confirmDelete ? (
          <div className="flex gap-2">
            <button
              onClick={() => void handleDelete()}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium"
            >
              Confirmar eliminación
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 border border-gray-300 py-2 rounded-lg text-sm"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full border border-red-300 text-red-600 py-2 rounded-lg text-sm font-medium"
          >
            Eliminar evento
          </button>
        )}
      </div>
    </div>
  );
}
