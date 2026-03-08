import type { SupabaseClient } from '@supabase/supabase-js';
import type { HomeEvent, CreateHomeEventInput, UpdateHomeEventInput } from '../../domain/models';
import type { HomeEventRepository, HomeEventFilters } from '../../domain/services';

interface HomeEventRow {
  id: string;
  fecha: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  area_id: string;
  prioridad: string;
  estado: string;
  costo_materiales: number | null;
  costo_mano_obra: number | null;
  costo_total: number | null;
  proveedor: string | null;
  evento_padre_id: string | null;
  creado_en: string;
  actualizado_en: string;
}

function toDomain(row: HomeEventRow): HomeEvent {
  return {
    id: row.id,
    date: row.fecha,
    type: row.tipo as HomeEvent['type'],
    title: row.titulo,
    description: row.descripcion,
    areaId: row.area_id,
    priority: row.prioridad as HomeEvent['priority'],
    status: row.estado as HomeEvent['status'],
    materialsCost: row.costo_materiales ?? undefined,
    laborCost: row.costo_mano_obra ?? undefined,
    totalCost: row.costo_total ?? undefined,
    vendorName: row.proveedor ?? undefined,
    parentEventId: row.evento_padre_id ?? undefined,
    createdAt: row.creado_en,
    updatedAt: row.actualizado_en,
  };
}

export class SupabaseHomeEventStore implements HomeEventRepository {
  constructor(private readonly client: SupabaseClient) {}

  async create(input: CreateHomeEventInput): Promise<HomeEvent> {
    const { data, error } = await this.client
      .from('home_events')
      .insert({
        fecha: input.date,
        tipo: input.type,
        titulo: input.title,
        descripcion: input.description,
        area_id: input.areaId,
        prioridad: input.priority,
        costo_materiales: input.materialsCost ?? null,
        costo_mano_obra: input.laborCost ?? null,
        costo_total: input.totalCost ?? null,
        proveedor: input.vendorName ?? null,
        evento_padre_id: input.parentEventId ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create event: ${error.message}`);
    return toDomain(data as HomeEventRow);
  }

  async getById(id: string): Promise<HomeEvent | null> {
    const { data, error } = await this.client
      .from('home_events')
      .select()
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch event: ${error.message}`);
    return data ? toDomain(data as HomeEventRow) : null;
  }

  async getAll(filters?: HomeEventFilters): Promise<HomeEvent[]> {
    let query = this.client.from('home_events').select();

    if (filters) {
      if (filters.type) query = query.eq('tipo', filters.type);
      if (filters.areaId) query = query.eq('area_id', filters.areaId);
      if (filters.priority) query = query.eq('prioridad', filters.priority);
      if (filters.status) query = query.eq('estado', filters.status);
      if (filters.fromDate) query = query.gte('fecha', filters.fromDate);
      if (filters.toDate) query = query.lte('fecha', filters.toDate);
    }

    const { data, error } = await query.order('fecha', { ascending: false });

    if (error) throw new Error(`Failed to fetch events: ${error.message}`);
    return (data as HomeEventRow[]).map(toDomain);
  }

  async update(id: string, input: UpdateHomeEventInput): Promise<HomeEvent> {
    const updateData: Record<string, unknown> = {};
    if (input.date !== undefined) updateData.fecha = input.date;
    if (input.type !== undefined) updateData.tipo = input.type;
    if (input.title !== undefined) updateData.titulo = input.title;
    if (input.description !== undefined) updateData.descripcion = input.description;
    if (input.areaId !== undefined) updateData.area_id = input.areaId;
    if (input.priority !== undefined) updateData.prioridad = input.priority;
    if (input.status !== undefined) updateData.estado = input.status;
    if (input.materialsCost !== undefined) updateData.costo_materiales = input.materialsCost;
    if (input.laborCost !== undefined) updateData.costo_mano_obra = input.laborCost;
    if (input.totalCost !== undefined) updateData.costo_total = input.totalCost;
    if (input.vendorName !== undefined) updateData.proveedor = input.vendorName;

    const { data, error } = await this.client
      .from('home_events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update event: ${error.message}`);
    return toDomain(data as HomeEventRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from('home_events')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete event: ${error.message}`);
  }
}
