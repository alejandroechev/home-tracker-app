import type { CreateHomeAreaInput } from '../models';
import type { ValidationResult, ValidationError } from './types';

export function validateCreateArea(input: CreateHomeAreaInput): ValidationResult {
  const errors: ValidationError[] = [];

  if (!input.name || !input.name.trim()) {
    errors.push({ field: 'name', message: 'El nombre del área es requerido' });
  }

  return { valid: errors.length === 0, errors };
}
