import { describe, it, expect, beforeEach } from 'vitest';
import { inMemoryHomeAreaStore } from '../../../src/infra/memory';
import type { CreateHomeAreaInput } from '../../../src/domain/models';

describe('InMemoryHomeAreaStore', () => {
  beforeEach(() => {
    inMemoryHomeAreaStore.reset();
  });

  const validInput: CreateHomeAreaInput = { name: 'Cocina' };

  describe('create', () => {
    it('should create an area with generated id and createdAt', async () => {
      const area = await inMemoryHomeAreaStore.create(validInput);

      expect(area.id).toBeDefined();
      expect(area.id.length).toBeGreaterThan(0);
      expect(area.name).toBe('Cocina');
      expect(area.createdAt).toBeDefined();
    });

    it('should create areas with unique ids', async () => {
      const a1 = await inMemoryHomeAreaStore.create(validInput);
      const a2 = await inMemoryHomeAreaStore.create({ name: 'Baño' });

      expect(a1.id).not.toBe(a2.id);
    });
  });

  describe('getAll', () => {
    it('should return all areas sorted by name', async () => {
      await inMemoryHomeAreaStore.create({ name: 'Jardín' });
      await inMemoryHomeAreaStore.create({ name: 'Cocina' });
      await inMemoryHomeAreaStore.create({ name: 'Baño' });

      const areas = await inMemoryHomeAreaStore.getAll();

      expect(areas).toHaveLength(3);
      expect(areas[0]!.name).toBe('Baño');
      expect(areas[1]!.name).toBe('Cocina');
      expect(areas[2]!.name).toBe('Jardín');
    });

    it('should return empty array when no areas exist', async () => {
      const areas = await inMemoryHomeAreaStore.getAll();
      expect(areas).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should return area by id', async () => {
      const created = await inMemoryHomeAreaStore.create(validInput);
      const found = await inMemoryHomeAreaStore.getById(created.id);

      expect(found).not.toBeNull();
      expect(found!.name).toBe('Cocina');
    });

    it('should return null for non-existent id', async () => {
      const found = await inMemoryHomeAreaStore.getById('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('getByName', () => {
    it('should find area by exact name', async () => {
      await inMemoryHomeAreaStore.create(validInput);
      const found = await inMemoryHomeAreaStore.getByName('Cocina');

      expect(found).not.toBeNull();
      expect(found!.name).toBe('Cocina');
    });

    it('should find area case-insensitively', async () => {
      await inMemoryHomeAreaStore.create(validInput);

      const lower = await inMemoryHomeAreaStore.getByName('cocina');
      const upper = await inMemoryHomeAreaStore.getByName('COCINA');
      const mixed = await inMemoryHomeAreaStore.getByName('cOcInA');

      expect(lower).not.toBeNull();
      expect(upper).not.toBeNull();
      expect(mixed).not.toBeNull();
    });

    it('should return null when no match', async () => {
      await inMemoryHomeAreaStore.create(validInput);
      const found = await inMemoryHomeAreaStore.getByName('Baño');
      expect(found).toBeNull();
    });
  });

  describe('reset', () => {
    it('should clear all areas', async () => {
      await inMemoryHomeAreaStore.create(validInput);
      await inMemoryHomeAreaStore.create({ name: 'Baño' });

      inMemoryHomeAreaStore.reset();

      const areas = await inMemoryHomeAreaStore.getAll();
      expect(areas).toEqual([]);
    });
  });
});
