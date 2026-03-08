import { describe, it, expect, beforeEach } from 'vitest';
import { inMemoryMaintenanceScheduleStore } from '../../../src/infra/memory';
import type { CreateMaintenanceScheduleInput } from '../../../src/domain/models';

describe('InMemoryMaintenanceScheduleStore', () => {
  beforeEach(() => {
    inMemoryMaintenanceScheduleStore.reset();
  });

  const validInput: CreateMaintenanceScheduleInput = {
    areaId: 'area-1',
    title: 'Clean gutters',
    description: 'Remove debris from gutters',
    frequencyDays: 90,
    nextDueDate: '2024-09-15',
  };

  describe('create', () => {
    it('should create a schedule with generated id and timestamps', async () => {
      const schedule = await inMemoryMaintenanceScheduleStore.create(validInput);

      expect(schedule.id).toBeDefined();
      expect(schedule.id.length).toBeGreaterThan(0);
      expect(schedule.areaId).toBe('area-1');
      expect(schedule.title).toBe('Clean gutters');
      expect(schedule.frequencyDays).toBe(90);
      expect(schedule.nextDueDate).toBe('2024-09-15');
      expect(schedule.createdAt).toBeDefined();
      expect(schedule.updatedAt).toBeDefined();
    });

    it('should create schedules with unique ids', async () => {
      const s1 = await inMemoryMaintenanceScheduleStore.create(validInput);
      const s2 = await inMemoryMaintenanceScheduleStore.create(validInput);

      expect(s1.id).not.toBe(s2.id);
    });

    it('should handle missing optional description', async () => {
      const input: CreateMaintenanceScheduleInput = {
        areaId: 'area-1',
        title: 'Check HVAC',
        frequencyDays: 180,
        nextDueDate: '2024-12-01',
      };
      const schedule = await inMemoryMaintenanceScheduleStore.create(input);
      expect(schedule.description).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return all schedules sorted by nextDueDate soonest first', async () => {
      await inMemoryMaintenanceScheduleStore.create({ ...validInput, nextDueDate: '2024-12-01', title: 'Far' });
      await inMemoryMaintenanceScheduleStore.create({ ...validInput, nextDueDate: '2024-06-01', title: 'Soon' });
      await inMemoryMaintenanceScheduleStore.create({ ...validInput, nextDueDate: '2024-09-01', title: 'Mid' });

      const schedules = await inMemoryMaintenanceScheduleStore.getAll();

      expect(schedules).toHaveLength(3);
      expect(schedules[0]!.title).toBe('Soon');
      expect(schedules[1]!.title).toBe('Mid');
      expect(schedules[2]!.title).toBe('Far');
    });

    it('should return empty array when no schedules exist', async () => {
      const schedules = await inMemoryMaintenanceScheduleStore.getAll();
      expect(schedules).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should return schedule by id', async () => {
      const created = await inMemoryMaintenanceScheduleStore.create(validInput);
      const found = await inMemoryMaintenanceScheduleStore.getById(created.id);

      expect(found).not.toBeNull();
      expect(found!.title).toBe('Clean gutters');
    });

    it('should return null for non-existent id', async () => {
      const found = await inMemoryMaintenanceScheduleStore.getById('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('markCompleted', () => {
    it('should set lastCompletedDate and recalculate nextDueDate', async () => {
      const created = await inMemoryMaintenanceScheduleStore.create({
        ...validInput,
        frequencyDays: 30,
        nextDueDate: '2024-06-15',
      });

      const updated = await inMemoryMaintenanceScheduleStore.markCompleted(created.id, '2024-06-10');

      expect(updated.lastCompletedDate).toBe('2024-06-10');
      expect(updated.nextDueDate).toBe('2024-07-10');
    });

    it('should update updatedAt timestamp', async () => {
      const created = await inMemoryMaintenanceScheduleStore.create(validInput);
      await new Promise((r) => setTimeout(r, 10));
      const updated = await inMemoryMaintenanceScheduleStore.markCompleted(created.id, '2024-06-10');

      expect(updated.updatedAt).not.toBe(created.updatedAt);
    });

    it('should throw for non-existent id', async () => {
      await expect(
        inMemoryMaintenanceScheduleStore.markCompleted('non-existent', '2024-06-10')
      ).rejects.toThrow();
    });

    it('should correctly add frequency days across month boundaries', async () => {
      const created = await inMemoryMaintenanceScheduleStore.create({
        ...validInput,
        frequencyDays: 45,
        nextDueDate: '2024-01-15',
      });

      const updated = await inMemoryMaintenanceScheduleStore.markCompleted(created.id, '2024-01-20');

      expect(updated.lastCompletedDate).toBe('2024-01-20');
      expect(updated.nextDueDate).toBe('2024-03-05');
    });
  });

  describe('delete', () => {
    it('should remove the schedule', async () => {
      const created = await inMemoryMaintenanceScheduleStore.create(validInput);
      await inMemoryMaintenanceScheduleStore.delete(created.id);

      const found = await inMemoryMaintenanceScheduleStore.getById(created.id);
      expect(found).toBeNull();
    });

    it('should throw for non-existent id', async () => {
      await expect(
        inMemoryMaintenanceScheduleStore.delete('non-existent')
      ).rejects.toThrow();
    });
  });

  describe('reset', () => {
    it('should clear all schedules', async () => {
      await inMemoryMaintenanceScheduleStore.create(validInput);
      await inMemoryMaintenanceScheduleStore.create(validInput);

      inMemoryMaintenanceScheduleStore.reset();

      const schedules = await inMemoryMaintenanceScheduleStore.getAll();
      expect(schedules).toEqual([]);
    });
  });
});
