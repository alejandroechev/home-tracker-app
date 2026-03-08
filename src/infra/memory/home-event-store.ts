import { v4 as uuidv4 } from 'uuid';
import type { HomeEvent, CreateHomeEventInput, UpdateHomeEventInput } from '../../domain/models';
import type { HomeEventRepository, HomeEventFilters } from '../../domain/services';

export class InMemoryHomeEventStore implements HomeEventRepository {
  private store = new Map<string, HomeEvent>();

  async create(input: CreateHomeEventInput): Promise<HomeEvent> {
    const now = new Date().toISOString();
    const event: HomeEvent = {
      id: uuidv4(),
      date: input.date,
      type: input.type,
      title: input.title,
      description: input.description,
      areaId: input.areaId,
      priority: input.priority,
      status: 'not_started',
      materialsCost: input.materialsCost,
      laborCost: input.laborCost,
      totalCost: input.totalCost,
      vendorName: input.vendorName,
      parentEventId: input.parentEventId,
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(event.id, event);
    return { ...event };
  }

  async getById(id: string): Promise<HomeEvent | null> {
    const event = this.store.get(id);
    return event ? { ...event } : null;
  }

  async getAll(filters?: HomeEventFilters): Promise<HomeEvent[]> {
    let events = Array.from(this.store.values());

    if (filters) {
      if (filters.type) {
        events = events.filter((e) => e.type === filters.type);
      }
      if (filters.areaId) {
        events = events.filter((e) => e.areaId === filters.areaId);
      }
      if (filters.priority) {
        events = events.filter((e) => e.priority === filters.priority);
      }
      if (filters.status) {
        events = events.filter((e) => e.status === filters.status);
      }
      if (filters.fromDate) {
        events = events.filter((e) => e.date >= filters.fromDate!);
      }
      if (filters.toDate) {
        events = events.filter((e) => e.date <= filters.toDate!);
      }
    }

    return events
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((e) => ({ ...e }));
  }

  async update(id: string, input: UpdateHomeEventInput): Promise<HomeEvent> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`Event with id ${id} not found`);
    }

    const updated: HomeEvent = {
      ...existing,
      ...input,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    this.store.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<void> {
    if (!this.store.has(id)) {
      throw new Error(`Event with id ${id} not found`);
    }
    this.store.delete(id);
  }

  reset(): void {
    this.store.clear();
  }
}
