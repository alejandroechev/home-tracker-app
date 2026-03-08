import type { SupabaseClient } from '@supabase/supabase-js';
import type { EventPhoto, CreateEventPhotoInput } from '../../domain/models';
import type { EventPhotoRepository } from '../../domain/services';

interface EventPhotoRow {
  id: string;
  evento_id: string;
  foto_url: string;
  descripcion: string | null;
  creado_en: string;
}

function toDomain(row: EventPhotoRow): EventPhoto {
  return {
    id: row.id,
    eventId: row.evento_id,
    photoUrl: row.foto_url,
    description: row.descripcion ?? undefined,
    createdAt: row.creado_en,
  };
}

export class SupabaseEventPhotoStore implements EventPhotoRepository {
  constructor(private readonly client: SupabaseClient) {}

  async create(input: CreateEventPhotoInput): Promise<EventPhoto> {
    const { data, error } = await this.client
      .from('event_photos')
      .insert({
        evento_id: input.eventId,
        foto_url: input.photoUrl,
        descripcion: input.description ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create photo: ${error.message}`);
    return toDomain(data as EventPhotoRow);
  }

  async getByEventId(eventId: string): Promise<EventPhoto[]> {
    const { data, error } = await this.client
      .from('event_photos')
      .select()
      .eq('evento_id', eventId);

    if (error) throw new Error(`Failed to fetch photos: ${error.message}`);
    return (data as EventPhotoRow[]).map(toDomain);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from('event_photos')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete photo: ${error.message}`);
  }
}
