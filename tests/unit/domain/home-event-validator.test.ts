import { describe, it, expect } from 'vitest';
import { validateCreateEvent, validateUpdateEvent } from '../../../src/domain/validators/home-event-validator';
import type { CreateHomeEventInput, UpdateHomeEventInput } from '../../../src/domain/models';

describe('validateCreateEvent', () => {
  const validInput: CreateHomeEventInput = {
    date: '2026-03-01',
    type: 'Reparación',
    title: 'Fix leaking faucet',
    description: 'Kitchen faucet dripping constantly',
    areaId: 'area-1',
    priority: 'high',
  };

  it('should accept a valid complete input', () => {
    const result = validateCreateEvent(validInput);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should accept valid input with optional cost fields', () => {
    const result = validateCreateEvent({
      ...validInput,
      materialsCost: 50,
      laborCost: 100,
      totalCost: 150,
      vendorName: 'Plumber Joe',
    });
    expect(result.valid).toBe(true);
  });

  it('should reject empty date', () => {
    const result = validateCreateEvent({ ...validInput, date: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'date' })
    );
  });

  it('should reject invalid date format', () => {
    const result = validateCreateEvent({ ...validInput, date: '01/03/2026' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'date' })
    );
  });

  it('should reject empty title', () => {
    const result = validateCreateEvent({ ...validInput, title: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'title' })
    );
  });

  it('should reject whitespace-only title', () => {
    const result = validateCreateEvent({ ...validInput, title: '   ' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'title' })
    );
  });

  it('should reject empty areaId', () => {
    const result = validateCreateEvent({ ...validInput, areaId: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'areaId' })
    );
  });

  it('should reject invalid event type', () => {
    const result = validateCreateEvent({ ...validInput, type: 'Invalid' as CreateHomeEventInput['type'] });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'type' })
    );
  });

  it('should reject invalid priority', () => {
    const result = validateCreateEvent({ ...validInput, priority: 'extreme' as CreateHomeEventInput['priority'] });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'priority' })
    );
  });

  it('should reject negative costs', () => {
    const result = validateCreateEvent({ ...validInput, materialsCost: -10 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'materialsCost' })
    );
  });

  it('should reject negative labor cost', () => {
    const result = validateCreateEvent({ ...validInput, laborCost: -5 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'laborCost' })
    );
  });

  it('should report multiple errors simultaneously', () => {
    const result = validateCreateEvent({
      ...validInput,
      date: '',
      title: '',
      areaId: '',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});

describe('validateUpdateEvent', () => {
  it('should accept a valid partial update', () => {
    const input: UpdateHomeEventInput = { title: 'Updated title' };
    const result = validateUpdateEvent(input);
    expect(result.valid).toBe(true);
  });

  it('should accept empty update (no fields)', () => {
    const result = validateUpdateEvent({});
    expect(result.valid).toBe(true);
  });

  it('should reject invalid date if provided', () => {
    const result = validateUpdateEvent({ date: 'not-a-date' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'date' })
    );
  });

  it('should reject empty title if provided', () => {
    const result = validateUpdateEvent({ title: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'title' })
    );
  });

  it('should reject invalid status if provided', () => {
    const result = validateUpdateEvent({ status: 'unknown' as UpdateHomeEventInput['status'] });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'status' })
    );
  });

  it('should reject negative costs if provided', () => {
    const result = validateUpdateEvent({ totalCost: -100 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'totalCost' })
    );
  });
});
