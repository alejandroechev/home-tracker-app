import { v4 as uuidv4 } from 'uuid';
import type { EventPhoto, CreateEventPhotoInput } from '../../domain/models';
import type { EventPhotoRepository } from '../../domain/services';

export class InMemoryEventPhotoStore implements EventPhotoRepository {
  private store = new Map<string, EventPhoto>();

  async create(input: CreateEventPhotoInput): Promise<EventPhoto> {
    const photo: EventPhoto = {
      id: uuidv4(),
      eventId: input.eventId,
      photoUrl: input.photoUrl,
      description: input.description,
      createdAt: new Date().toISOString(),
    };
    this.store.set(photo.id, photo);
    return { ...photo };
  }

  async getByEventId(eventId: string): Promise<EventPhoto[]> {
    return Array.from(this.store.values())
      .filter((p) => p.eventId === eventId)
      .map((p) => ({ ...p }));
  }

  async delete(id: string): Promise<void> {
    if (!this.store.has(id)) {
      throw new Error(`Photo with id ${id} not found`);
    }
    this.store.delete(id);
  }

  reset(): void {
    this.store.clear();
  }
}
