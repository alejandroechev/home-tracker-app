import { useState, useEffect, useCallback } from 'react';
import type { MaintenanceSchedule } from '../../domain/models';
import { getAllSchedules, getAreaById } from '../../infra/store-provider';

export function MantencionesPage() {
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [areaMap, setAreaMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getAllSchedules();
    setSchedules(result);

    const areaIds = [...new Set(result.map((s) => s.areaId))];
    const map: Record<string, string> = {};
    for (const id of areaIds) {
      const area = await getAreaById(id);
      if (area) map[id] = area.name;
    }
    setAreaMap(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const isOverdue = (nextDueDate: string) => nextDueDate < new Date().toISOString().split('T')[0]!;

  if (loading) {
    return <p className="text-center text-gray-500 py-8">Cargando...</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Mantenciones</h2>
      {schedules.length === 0 ? (
        <p className="text-center text-gray-500 py-4">No hay mantenciones programadas</p>
      ) : (
        <div className="space-y-3">
          {schedules.map((s) => (
            <div
              key={s.id}
              className={`bg-white rounded-lg shadow-sm border p-4 ${
                isOverdue(s.nextDueDate) ? 'border-red-300' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-gray-900 text-sm">{s.title}</h3>
                {isOverdue(s.nextDueDate) && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Vencida</span>
                )}
              </div>
              {s.description && (
                <p className="text-xs text-gray-500 mb-2">{s.description}</p>
              )}
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                {areaMap[s.areaId] && <span>📍 {areaMap[s.areaId]}</span>}
                <span>📅 Próxima: {s.nextDueDate}</span>
                <span>🔄 Cada {s.frequencyDays} días</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
