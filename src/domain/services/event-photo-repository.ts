import type { EventPhoto, CreateEventPhotoInput } from '../models';

export interface EventPhotoRepository {
  create(input: CreateEventPhotoInput): Promise<EventPhoto>;
  getByEventId(eventId: string): Promise<EventPhoto[]>;
  delete(id: string): Promise<void>;
}
