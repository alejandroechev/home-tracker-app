import type { HomeEvent, CreateHomeEventInput, UpdateHomeEventInput, EventType, Priority, EventStatus } from '../models';

export interface HomeEventFilters {
  type?: EventType;
  areaId?: string;
  priority?: Priority;
  status?: EventStatus;
  fromDate?: string;
  toDate?: string;
}

export interface HomeEventRepository {
  create(input: CreateHomeEventInput): Promise<HomeEvent>;
  getById(id: string): Promise<HomeEvent | null>;
  getAll(filters?: HomeEventFilters): Promise<HomeEvent[]>;
  update(id: string, input: UpdateHomeEventInput): Promise<HomeEvent>;
  delete(id: string): Promise<void>;
}
