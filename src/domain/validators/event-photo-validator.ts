import type { CreateEventPhotoInput } from '../models';
import type { ValidationResult, ValidationError } from './types';

export function validateCreatePhoto(input: CreateEventPhotoInput): ValidationResult {
  const errors: ValidationError[] = [];

  if (!input.eventId || !input.eventId.trim()) {
    errors.push({ field: 'eventId', message: 'El ID del evento es requerido' });
  }

  if (!input.photoUrl || !input.photoUrl.trim()) {
    errors.push({ field: 'photoUrl', message: 'La URL de la foto es requerida' });
  }

  return { valid: errors.length === 0, errors };
}
