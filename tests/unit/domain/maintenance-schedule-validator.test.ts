import { describe, it, expect } from 'vitest';
import { validateCreateSchedule } from '../../../src/domain/validators/maintenance-schedule-validator';
import type { CreateMaintenanceScheduleInput } from '../../../src/domain/models';

describe('validateCreateSchedule', () => {
  const validInput: CreateMaintenanceScheduleInput = {
    areaId: 'area-1',
    title: 'Clean gutters',
    frequencyDays: 180,
    nextDueDate: '2026-06-01',
  };

  it('should accept valid input', () => {
    const result = validateCreateSchedule(validInput);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should accept valid input with description', () => {
    const result = validateCreateSchedule({ ...validInput, description: 'Use ladder' });
    expect(result.valid).toBe(true);
  });

  it('should reject empty areaId', () => {
    const result = validateCreateSchedule({ ...validInput, areaId: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'areaId' })
    );
  });

  it('should reject empty title', () => {
    const result = validateCreateSchedule({ ...validInput, title: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'title' })
    );
  });

  it('should reject zero frequency', () => {
    const result = validateCreateSchedule({ ...validInput, frequencyDays: 0 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'frequencyDays' })
    );
  });

  it('should reject negative frequency', () => {
    const result = validateCreateSchedule({ ...validInput, frequencyDays: -30 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'frequencyDays' })
    );
  });

  it('should reject invalid nextDueDate', () => {
    const result = validateCreateSchedule({ ...validInput, nextDueDate: 'tomorrow' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'nextDueDate' })
    );
  });

  it('should report multiple errors simultaneously', () => {
    const result = validateCreateSchedule({
      areaId: '',
      title: '',
      frequencyDays: -1,
      nextDueDate: 'invalid',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });
});
