import { useEffect, useState, useCallback } from 'react';
import type { HomeArea } from '../../domain/models';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard';
import { getAllAreas } from '../../infra/store-provider';

interface InicioPageProps {
  onEventClick: (eventId: string) => void;
}

export function InicioPage({ onEventClick }: InicioPageProps) {
  const { events, loading } = useEvents();
  const [areaMap, setAreaMap] = useState<Record<string, string>>({});

  const loadAreas = useCallback(async () => {
    const areas = await getAllAreas();
    const map: Record<string, string> = {};
    areas.forEach((a: HomeArea) => { map[a.id] = a.name; });
    setAreaMap(map);
  }, []);

  useEffect(() => {
    void loadAreas();
  }, [loadAreas]);

  const recentEvents = events.slice(0, 10);

  if (loading) {
    return <p className="text-center text-gray-500 py-8">Cargando...</p>;
  }

  if (recentEvents.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        No hay eventos registrados
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-800">Eventos recientes</h2>
      {recentEvents.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          areaName={areaMap[event.areaId]}
          onClick={() => onEventClick(event.id)}
        />
      ))}
    </div>
  );
}
