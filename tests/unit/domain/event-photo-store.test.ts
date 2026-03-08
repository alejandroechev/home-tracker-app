import { describe, it, expect, beforeEach } from 'vitest';
import { inMemoryEventPhotoStore } from '../../../src/infra/memory';
import type { CreateEventPhotoInput } from '../../../src/domain/models';

describe('InMemoryEventPhotoStore', () => {
  beforeEach(() => {
    inMemoryEventPhotoStore.reset();
  });

  const validInput: CreateEventPhotoInput = {
    eventId: 'event-1',
    photoUrl: 'https://example.com/photo.jpg',
    description: 'Kitchen photo',
  };

  describe('create', () => {
    it('should create a photo with generated id and createdAt', async () => {
      const photo = await inMemoryEventPhotoStore.create(validInput);

      expect(photo.id).toBeDefined();
      expect(photo.id.length).toBeGreaterThan(0);
      expect(photo.eventId).toBe('event-1');
      expect(photo.photoUrl).toBe('https://example.com/photo.jpg');
      expect(photo.description).toBe('Kitchen photo');
      expect(photo.createdAt).toBeDefined();
    });

    it('should create photos with unique ids', async () => {
      const p1 = await inMemoryEventPhotoStore.create(validInput);
      const p2 = await inMemoryEventPhotoStore.create(validInput);

      expect(p1.id).not.toBe(p2.id);
    });

    it('should handle missing optional description', async () => {
      const input: CreateEventPhotoInput = {
        eventId: 'event-1',
        photoUrl: 'https://example.com/photo.jpg',
      };
      const photo = await inMemoryEventPhotoStore.create(input);
      expect(photo.description).toBeUndefined();
    });
  });

  describe('getByEventId', () => {
    it('should return photos for a specific event', async () => {
      await inMemoryEventPhotoStore.create({ ...validInput, eventId: 'event-1' });
      await inMemoryEventPhotoStore.create({ ...validInput, eventId: 'event-1' });
      await inMemoryEventPhotoStore.create({ ...validInput, eventId: 'event-2' });

      const photos = await inMemoryEventPhotoStore.getByEventId('event-1');

      expect(photos).toHaveLength(2);
      photos.forEach((p) => expect(p.eventId).toBe('event-1'));
    });

    it('should return empty array when no photos for event', async () => {
      const photos = await inMemoryEventPhotoStore.getByEventId('non-existent');
      expect(photos).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should remove the photo', async () => {
      const created = await inMemoryEventPhotoStore.create(validInput);
      await inMemoryEventPhotoStore.delete(created.id);

      const photos = await inMemoryEventPhotoStore.getByEventId('event-1');
      expect(photos).toHaveLength(0);
    });

    it('should throw for non-existent id', async () => {
      await expect(
        inMemoryEventPhotoStore.delete('non-existent')
      ).rejects.toThrow();
    });
  });

  describe('reset', () => {
    it('should clear all photos', async () => {
      await inMemoryEventPhotoStore.create(validInput);
      await inMemoryEventPhotoStore.create(validInput);

      inMemoryEventPhotoStore.reset();

      const photos = await inMemoryEventPhotoStore.getByEventId('event-1');
      expect(photos).toEqual([]);
    });
  });
});
