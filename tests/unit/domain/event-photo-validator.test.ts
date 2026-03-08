import { describe, it, expect } from 'vitest';
import { validateCreatePhoto } from '../../../src/domain/validators/event-photo-validator';
import type { CreateEventPhotoInput } from '../../../src/domain/models';

describe('validateCreatePhoto', () => {
  const validInput: CreateEventPhotoInput = {
    eventId: 'event-1',
    photoUrl: 'https://storage.supabase.co/photos/photo1.jpg',
  };

  it('should accept valid input', () => {
    const result = validateCreatePhoto(validInput);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should accept valid input with description', () => {
    const result = validateCreatePhoto({ ...validInput, description: 'Before fix' });
    expect(result.valid).toBe(true);
  });

  it('should reject empty eventId', () => {
    const result = validateCreatePhoto({ ...validInput, eventId: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'eventId' })
    );
  });

  it('should reject empty photoUrl', () => {
    const result = validateCreatePhoto({ ...validInput, photoUrl: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'photoUrl' })
    );
  });

  it('should report multiple errors simultaneously', () => {
    const result = validateCreatePhoto({ eventId: '', photoUrl: '' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});
