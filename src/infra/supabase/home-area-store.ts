import type { SupabaseClient } from '@supabase/supabase-js';
import type { HomeArea, CreateHomeAreaInput } from '../../domain/models';
import type { HomeAreaRepository } from '../../domain/services';

interface HomeAreaRow {
  id: string;
  nombre: string;
  creado_en: string;
}

function toDomain(row: HomeAreaRow): HomeArea {
  return {
    id: row.id,
    name: row.nombre,
    createdAt: row.creado_en,
  };
}

export class SupabaseHomeAreaStore implements HomeAreaRepository {
  constructor(private readonly client: SupabaseClient) {}

  async create(input: CreateHomeAreaInput): Promise<HomeArea> {
    const { data, error } = await this.client
      .from('home_areas')
      .insert({ nombre: input.name })
      .select()
      .single();

    if (error) throw new Error(`Failed to create area: ${error.message}`);
    return toDomain(data as HomeAreaRow);
  }

  async getAll(): Promise<HomeArea[]> {
    const { data, error } = await this.client
      .from('home_areas')
      .select()
      .order('nombre', { ascending: true });

    if (error) throw new Error(`Failed to fetch areas: ${error.message}`);
    return (data as HomeAreaRow[]).map(toDomain);
  }

  async getById(id: string): Promise<HomeArea | null> {
    const { data, error } = await this.client
      .from('home_areas')
      .select()
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch area: ${error.message}`);
    return data ? toDomain(data as HomeAreaRow) : null;
  }

  async getByName(name: string): Promise<HomeArea | null> {
    const { data, error } = await this.client
      .from('home_areas')
      .select()
      .ilike('nombre', name)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch area by name: ${error.message}`);
    return data ? toDomain(data as HomeAreaRow) : null;
  }
}
