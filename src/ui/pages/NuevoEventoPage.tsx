import type { CreateHomeEventInput } from '../../domain/models';
import { EventForm } from '../components/EventForm';
import { createEvent } from '../../infra/store-provider';

interface NuevoEventoPageProps {
  onSuccess: () => void;
}

export function NuevoEventoPage({ onSuccess }: NuevoEventoPageProps) {
  const handleSubmit = async (input: CreateHomeEventInput) => {
    await createEvent(input);
    onSuccess();
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Nuevo Evento</h2>
      <EventForm onSubmit={handleSubmit} />
    </div>
  );
}
