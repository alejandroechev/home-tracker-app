import { useState, useEffect } from 'react';
import type { HomeArea } from '../../domain/models';
import { getAllAreas, createArea } from '../../infra/store-provider';

interface AreaSelectProps {
  value: string;
  onChange: (areaId: string) => void;
  error?: string;
}

export function AreaSelect({ value, onChange, error }: AreaSelectProps) {
  const [areas, setAreas] = useState<HomeArea[]>([]);
  const [creating, setCreating] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    void getAllAreas().then(setAreas);
  }, []);

  const handleCreateArea = async () => {
    const name = newAreaName.trim();
    if (!name) {
      setCreateError('El nombre es requerido');
      return;
    }
    try {
      const area = await createArea({ name });
      setAreas((prev) => [...prev, area]);
      onChange(area.id);
      setNewAreaName('');
      setCreating(false);
      setCreateError('');
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error al crear área');
    }
  };

  if (creating) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newAreaName}
            onChange={(e) => setNewAreaName(e.target.value)}
            placeholder="Nombre del área"
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => void handleCreateArea()}
            className="bg-blue-600 text-white px-3 py-2 rounded text-sm"
          >
            Crear
          </button>
          <button
            type="button"
            onClick={() => { setCreating(false); setCreateError(''); }}
            className="text-gray-500 px-2 py-2 text-sm"
          >
            Cancelar
          </button>
        </div>
        {createError && <p className="text-red-600 text-xs mt-1">{createError}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
      <select
        value={value}
        onChange={(e) => {
          if (e.target.value === '__create__') {
            setCreating(true);
          } else {
            onChange(e.target.value);
          }
        }}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
      >
        <option value="">Seleccionar área...</option>
        {areas.map((area) => (
          <option key={area.id} value={area.id}>
            {area.name}
          </option>
        ))}
        <option value="__create__">Crear nueva área...</option>
      </select>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}
