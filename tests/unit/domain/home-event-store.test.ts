import { describe, it, expect, beforeEach } from 'vitest';
import { inMemoryHomeEventStore } from '../../../src/infra/memory';
import type { CreateHomeEventInput } from '../../../src/domain/models';

describe('InMemoryHomeEventStore', () => {
  beforeEach(() => {
    inMemoryHomeEventStore.reset();
  });

  const validInput: CreateHomeEventInput = {
    date: '2024-06-15',
    type: 'Reparación',
    title: 'Fix kitchen sink',
    description: 'Replace the faucet',
    areaId: 'area-1',
    priority: 'high',
  };

  describe('create', () => {
    it('should create an event with generated id and default status', async () => {
      const event = await inMemoryHomeEventStore.create(validInput);

      expect(event.id).toBeDefined();
      expect(event.id.length).toBeGreaterThan(0);
      expect(event.title).toBe('Fix kitchen sink');
      expect(event.status).toBe('not_started');
      expect(event.createdAt).toBeDefined();
      expect(event.updatedAt).toBeDefined();
    });

    it('should create events with unique ids', async () => {
      const e1 = await inMemoryHomeEventStore.create(validInput);
      const e2 = await inMemoryHomeEventStore.create(validInput);

      expect(e1.id).not.toBe(e2.id);
    });

    it('should preserve optional fields', async () => {
      const input: CreateHomeEventInput = {
        ...validInput,
        materialsCost: 5000,
        laborCost: 3000,
        totalCost: 8000,
        vendorName: 'PlumberCo',
        parentEventId: 'parent-1',
      };
      const event = await inMemoryHomeEventStore.create(input);

      expect(event.materialsCost).toBe(5000);
      expect(event.laborCost).toBe(3000);
      expect(event.totalCost).toBe(8000);
      expect(event.vendorName).toBe('PlumberCo');
      expect(event.parentEventId).toBe('parent-1');
    });
  });

  describe('getById', () => {
    it('should return event by id', async () => {
      const created = await inMemoryHomeEventStore.create(validInput);
      const found = await inMemoryHomeEventStore.getById(created.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.title).toBe('Fix kitchen sink');
    });

    it('should return null for non-existent id', async () => {
      const found = await inMemoryHomeEventStore.getById('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should return all events sorted newest-first by date', async () => {
      await inMemoryHomeEventStore.create({ ...validInput, date: '2024-01-01', title: 'Old' });
      await inMemoryHomeEventStore.create({ ...validInput, date: '2024-06-15', title: 'Mid' });
      await inMemoryHomeEventStore.create({ ...validInput, date: '2024-12-31', title: 'New' });

      const events = await inMemoryHomeEventStore.getAll();

      expect(events).toHaveLength(3);
      expect(events[0]!.title).toBe('New');
      expect(events[1]!.title).toBe('Mid');
      expect(events[2]!.title).toBe('Old');
    });

    it('should return empty array when no events exist', async () => {
      const events = await inMemoryHomeEventStore.getAll();
      expect(events).toEqual([]);
    });

    it('should filter by type', async () => {
      await inMemoryHomeEventStore.create({ ...validInput, type: 'Reparación' });
      await inMemoryHomeEventStore.create({ ...validInput, type: 'Mantención' });

      const events = await inMemoryHomeEventStore.getAll({ type: 'Reparación' });

      expect(events).toHaveLength(1);
      expect(events[0]!.type).toBe('Reparación');
    });

    it('should filter by areaId', async () => {
      await inMemoryHomeEventStore.create({ ...validInput, areaId: 'area-1' });
      await inMemoryHomeEventStore.create({ ...validInput, areaId: 'area-2' });

      const events = await inMemoryHomeEventStore.getAll({ areaId: 'area-1' });

      expect(events).toHaveLength(1);
      expect(events[0]!.areaId).toBe('area-1');
    });

    it('should filter by priority', async () => {
      await inMemoryHomeEventStore.create({ ...validInput, priority: 'high' });
      await inMemoryHomeEventStore.create({ ...validInput, priority: 'low' });

      const events = await inMemoryHomeEventStore.getAll({ priority: 'low' });

      expect(events).toHaveLength(1);
      expect(events[0]!.priority).toBe('low');
    });

    it('should filter by status', async () => {
      const e = await inMemoryHomeEventStore.create(validInput);
      await inMemoryHomeEventStore.update(e.id, { status: 'completed' });
      await inMemoryHomeEventStore.create(validInput);

      const events = await inMemoryHomeEventStore.getAll({ status: 'completed' });

      expect(events).toHaveLength(1);
      expect(events[0]!.status).toBe('completed');
    });

    it('should filter by fromDate', async () => {
      await inMemoryHomeEventStore.create({ ...validInput, date: '2024-01-01' });
      await inMemoryHomeEventStore.create({ ...validInput, date: '2024-06-15' });

      const events = await inMemoryHomeEventStore.getAll({ fromDate: '2024-06-01' });

      expect(events).toHaveLength(1);
      expect(events[0]!.date).toBe('2024-06-15');
    });

    it('should filter by toDate', async () => {
      await inMemoryHomeEventStore.create({ ...validInput, date: '2024-01-01' });
      await inMemoryHomeEventStore.create({ ...validInput, date: '2024-06-15' });

      const events = await inMemoryHomeEventStore.getAll({ toDate: '2024-03-01' });

      expect(events).toHaveLength(1);
      expect(events[0]!.date).toBe('2024-01-01');
    });

    it('should combine multiple filters', async () => {
      await inMemoryHomeEventStore.create({ ...validInput, type: 'Reparación', priority: 'high', date: '2024-06-15' });
      await inMemoryHomeEventStore.create({ ...validInput, type: 'Mantención', priority: 'high', date: '2024-06-15' });
      await inMemoryHomeEventStore.create({ ...validInput, type: 'Reparación', priority: 'low', date: '2024-06-15' });

      const events = await inMemoryHomeEventStore.getAll({ type: 'Reparación', priority: 'high' });

      expect(events).toHaveLength(1);
      expect(events[0]!.type).toBe('Reparación');
      expect(events[0]!.priority).toBe('high');
    });
  });

  describe('update', () => {
    it('should update specified fields', async () => {
      const created = await inMemoryHomeEventStore.create(validInput);
      const updated = await inMemoryHomeEventStore.update(created.id, {
        title: 'Updated title',
        status: 'in_progress',
      });

      expect(updated.title).toBe('Updated title');
      expect(updated.status).toBe('in_progress');
      expect(updated.description).toBe('Replace the faucet');
    });

    it('should update updatedAt timestamp', async () => {
      const created = await inMemoryHomeEventStore.create(validInput);
      await new Promise((r) => setTimeout(r, 10));
      const updated = await inMemoryHomeEventStore.update(created.id, { title: 'New' });

      expect(updated.updatedAt).not.toBe(created.updatedAt);
    });

    it('should throw for non-existent id', async () => {
      await expect(
        inMemoryHomeEventStore.update('non-existent', { title: 'X' })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should remove the event', async () => {
      const created = await inMemoryHomeEventStore.create(validInput);
      await inMemoryHomeEventStore.delete(created.id);

      const found = await inMemoryHomeEventStore.getById(created.id);
      expect(found).toBeNull();
    });

    it('should throw for non-existent id', async () => {
      await expect(
        inMemoryHomeEventStore.delete('non-existent')
      ).rejects.toThrow();
    });
  });

  describe('reset', () => {
    it('should clear all events', async () => {
      await inMemoryHomeEventStore.create(validInput);
      await inMemoryHomeEventStore.create(validInput);

      inMemoryHomeEventStore.reset();

      const events = await inMemoryHomeEventStore.getAll();
      expect(events).toEqual([]);
    });
  });
});
