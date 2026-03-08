import { useState } from 'react';
import type { CreateHomeEventInput, EventType, Priority } from '../../domain/models';
import { EVENT_TYPES, PRIORITIES } from '../../domain/models';
import { validateCreateEvent } from '../../domain/validators';
import type { ValidationError } from '../../domain/validators';
import { AreaSelect } from './AreaSelect';

interface EventFormProps {
  onSubmit: (input: CreateHomeEventInput) => Promise<void>;
}

const priorityLabels: Record<Priority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
};

function todayStr(): string {
  return new Date().toISOString().split('T')[0]!;
}

export function EventForm({ onSubmit }: EventFormProps) {
  const [date, setDate] = useState(todayStr());
  const [type, setType] = useState<EventType>('Reparación');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [areaId, setAreaId] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [materialsCost, setMaterialsCost] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fieldError = (field: string) =>
    errors.find((e) => e.field === field)?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const input: CreateHomeEventInput = {
      date,
      type,
      title: title.trim(),
      description: description.trim(),
      areaId,
      priority,
      ...(materialsCost ? { materialsCost: Number(materialsCost) } : {}),
      ...(laborCost ? { laborCost: Number(laborCost) } : {}),
      ...(totalCost ? { totalCost: Number(totalCost) } : {}),
      ...(vendorName.trim() ? { vendorName: vendorName.trim() } : {}),
    };

    const result = validateCreateEvent(input);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(input);
    } catch {
      setErrors([{ field: 'form', message: 'Error al guardar el evento' }]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      {fieldError('form') && (
        <p className="text-red-600 text-sm">{fieldError('form')}</p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
        {fieldError('date') && <p className="text-red-600 text-xs mt-1">{fieldError('date')}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as EventType)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        >
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {fieldError('type') && <p className="text-red-600 text-xs mt-1">{fieldError('type')}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Describe brevemente el evento"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
        {fieldError('title') && <p className="text-red-600 text-xs mt-1">{fieldError('title')}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Detalles adicionales..."
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
      </div>

      <AreaSelect value={areaId} onChange={setAreaId} error={fieldError('areaId')} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{priorityLabels[p]}</option>
          ))}
        </select>
      </div>

      <details className="border border-gray-200 rounded p-3">
        <summary className="text-sm font-medium text-gray-700 cursor-pointer">
          Costos y proveedor (opcional)
        </summary>
        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Costo materiales</label>
            <input
              type="number"
              min="0"
              value={materialsCost}
              onChange={(e) => setMaterialsCost(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
            {fieldError('materialsCost') && (
              <p className="text-red-600 text-xs mt-1">{fieldError('materialsCost')}</p>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Costo mano de obra</label>
            <input
              type="number"
              min="0"
              value={laborCost}
              onChange={(e) => setLaborCost(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
            {fieldError('laborCost') && (
              <p className="text-red-600 text-xs mt-1">{fieldError('laborCost')}</p>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Costo total</label>
            <input
              type="number"
              min="0"
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
            {fieldError('totalCost') && (
              <p className="text-red-600 text-xs mt-1">{fieldError('totalCost')}</p>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Proveedor</label>
            <input
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="Nombre del proveedor"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>
      </details>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
      >
        {submitting ? 'Guardando...' : 'Guardar Evento'}
      </button>
    </form>
  );
}
