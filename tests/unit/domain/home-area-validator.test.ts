import { describe, it, expect } from 'vitest';
import { validateCreateArea } from '../../../src/domain/validators/home-area-validator';
import type { CreateHomeAreaInput } from '../../../src/domain/models';

describe('validateCreateArea', () => {
  it('should accept a valid area name', () => {
    const input: CreateHomeAreaInput = { name: 'Cocina' };
    const result = validateCreateArea(input);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject empty name', () => {
    const result = validateCreateArea({ name: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'name' })
    );
  });

  it('should reject whitespace-only name', () => {
    const result = validateCreateArea({ name: '   ' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ field: 'name' })
    );
  });
});
