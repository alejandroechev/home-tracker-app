import type { HomeArea, CreateHomeAreaInput } from '../models';

export interface HomeAreaRepository {
  create(input: CreateHomeAreaInput): Promise<HomeArea>;
  getAll(): Promise<HomeArea[]>;
  getById(id: string): Promise<HomeArea | null>;
  getByName(name: string): Promise<HomeArea | null>;
}
