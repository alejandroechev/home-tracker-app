import type { SupabaseClient } from '@supabase/supabase-js';
import type { MaintenanceSchedule, CreateMaintenanceScheduleInput } from '../../domain/models';
import type { MaintenanceScheduleRepository } from '../../domain/services';

interface MaintenanceScheduleRow {
  id: string;
  area_id: string;
  titulo: string;
  descripcion: string | null;
  frecuencia_dias: number;
  ultima_fecha_completada: string | null;
  proxima_fecha: string;
  creado_en: string;
  actualizado_en: string;
}

function toDomain(row: MaintenanceScheduleRow): MaintenanceSchedule {
  return {
    id: row.id,
    areaId: row.area_id,
    title: row.titulo,
    description: row.descripcion ?? undefined,
    frequencyDays: row.frecuencia_dias,
    lastCompletedDate: row.ultima_fecha_completada ?? undefined,
    nextDueDate: row.proxima_fecha,
    createdAt: row.creado_en,
    updatedAt: row.actualizado_en,
  };
}

export class SupabaseMaintenanceScheduleStore implements MaintenanceScheduleRepository {
  constructor(private readonly client: SupabaseClient) {}

  async create(input: CreateMaintenanceScheduleInput): Promise<MaintenanceSchedule> {
    const { data, error } = await this.client
      .from('maintenance_schedules')
      .insert({
        area_id: input.areaId,
        titulo: input.title,
        descripcion: input.description ?? null,
        frecuencia_dias: input.frequencyDays,
        proxima_fecha: input.nextDueDate,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create schedule: ${error.message}`);
    return toDomain(data as MaintenanceScheduleRow);
  }

  async getAll(): Promise<MaintenanceSchedule[]> {
    const { data, error } = await this.client
      .from('maintenance_schedules')
      .select()
      .order('proxima_fecha', { ascending: true });

    if (error) throw new Error(`Failed to fetch schedules: ${error.message}`);
    return (data as MaintenanceScheduleRow[]).map(toDomain);
  }

  async getById(id: string): Promise<MaintenanceSchedule | null> {
    const { data, error } = await this.client
      .from('maintenance_schedules')
      .select()
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch schedule: ${error.message}`);
    return data ? toDomain(data as MaintenanceScheduleRow) : null;
  }

  async markCompleted(id: string, completedDate: string): Promise<MaintenanceSchedule> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`MaintenanceSchedule with id ${id} not found`);

    const completed = new Date(completedDate);
    completed.setDate(completed.getDate() + existing.frequencyDays);
    const nextDueDate = completed.toISOString().split('T')[0]!;

    const { data, error } = await this.client
      .from('maintenance_schedules')
      .update({
        ultima_fecha_completada: completedDate,
        proxima_fecha: nextDueDate,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to mark schedule completed: ${error.message}`);
    return toDomain(data as MaintenanceScheduleRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from('maintenance_schedules')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete schedule: ${error.message}`);
  }
}
