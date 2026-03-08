import type { CreateHomeEventInput, UpdateHomeEventInput } from '../models';
import { EVENT_TYPES, PRIORITIES, EVENT_STATUSES } from '../models/home-event';
import type { ValidationResult, ValidationError } from './types';

function isValidDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr + 'T00:00:00Z');
  return !isNaN(d.getTime()) && d.toISOString().startsWith(dateStr);
}

export function validateCreateEvent(input: CreateHomeEventInput): ValidationResult {
  const errors: ValidationError[] = [];

  if (!input.date || !isValidDate(input.date)) {
    errors.push({ field: 'date', message: 'La fecha debe tener formato YYYY-MM-DD válido' });
  }

  if (!input.title || !input.title.trim()) {
    errors.push({ field: 'title', message: 'El título es requerido' });
  }

  if (!input.areaId || !input.areaId.trim()) {
    errors.push({ field: 'areaId', message: 'El área es requerida' });
  }

  if (!EVENT_TYPES.includes(input.type)) {
    errors.push({ field: 'type', message: `El tipo debe ser uno de: ${EVENT_TYPES.join(', ')}` });
  }

  if (!PRIORITIES.includes(input.priority)) {
    errors.push({ field: 'priority', message: `La prioridad debe ser una de: ${PRIORITIES.join(', ')}` });
  }

  if (input.materialsCost !== undefined && input.materialsCost < 0) {
    errors.push({ field: 'materialsCost', message: 'El costo de materiales no puede ser negativo' });
  }

  if (input.laborCost !== undefined && input.laborCost < 0) {
    errors.push({ field: 'laborCost', message: 'El costo de mano de obra no puede ser negativo' });
  }

  if (input.totalCost !== undefined && input.totalCost < 0) {
    errors.push({ field: 'totalCost', message: 'El costo total no puede ser negativo' });
  }

  return { valid: errors.length === 0, errors };
}

export function validateUpdateEvent(input: UpdateHomeEventInput): ValidationResult {
  const errors: ValidationError[] = [];

  if (input.date !== undefined && !isValidDate(input.date)) {
    errors.push({ field: 'date', message: 'La fecha debe tener formato YYYY-MM-DD válido' });
  }

  if (input.title !== undefined && !input.title.trim()) {
    errors.push({ field: 'title', message: 'El título es requerido' });
  }

  if (input.type !== undefined && !EVENT_TYPES.includes(input.type)) {
    errors.push({ field: 'type', message: `El tipo debe ser uno de: ${EVENT_TYPES.join(', ')}` });
  }

  if (input.priority !== undefined && !PRIORITIES.includes(input.priority)) {
    errors.push({ field: 'priority', message: `La prioridad debe ser una de: ${PRIORITIES.join(', ')}` });
  }

  if (input.status !== undefined && !EVENT_STATUSES.includes(input.status)) {
    errors.push({ field: 'status', message: `El estado debe ser uno de: ${EVENT_STATUSES.join(', ')}` });
  }

  if (input.materialsCost !== undefined && input.materialsCost < 0) {
    errors.push({ field: 'materialsCost', message: 'El costo de materiales no puede ser negativo' });
  }

  if (input.laborCost !== undefined && input.laborCost < 0) {
    errors.push({ field: 'laborCost', message: 'El costo de mano de obra no puede ser negativo' });
  }

  if (input.totalCost !== undefined && input.totalCost < 0) {
    errors.push({ field: 'totalCost', message: 'El costo total no puede ser negativo' });
  }

  return { valid: errors.length === 0, errors };
}
