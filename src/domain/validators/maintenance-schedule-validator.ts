import type { CreateMaintenanceScheduleInput } from '../models';
import type { ValidationResult, ValidationError } from './types';

function isValidDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr + 'T00:00:00Z');
  return !isNaN(d.getTime()) && d.toISOString().startsWith(dateStr);
}

export function validateCreateSchedule(input: CreateMaintenanceScheduleInput): ValidationResult {
  const errors: ValidationError[] = [];

  if (!input.areaId || !input.areaId.trim()) {
    errors.push({ field: 'areaId', message: 'El área es requerida' });
  }

  if (!input.title || !input.title.trim()) {
    errors.push({ field: 'title', message: 'El título es requerido' });
  }

  if (!input.frequencyDays || input.frequencyDays <= 0) {
    errors.push({ field: 'frequencyDays', message: 'La frecuencia debe ser mayor a 0 días' });
  }

  if (!input.nextDueDate || !isValidDate(input.nextDueDate)) {
    errors.push({ field: 'nextDueDate', message: 'La próxima fecha debe tener formato YYYY-MM-DD válido' });
  }

  return { valid: errors.length === 0, errors };
}
