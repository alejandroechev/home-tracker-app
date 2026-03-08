import { v4 as uuidv4 } from 'uuid';
import type { MaintenanceSchedule, CreateMaintenanceScheduleInput } from '../../domain/models';
import type { MaintenanceScheduleRepository } from '../../domain/services';

export class InMemoryMaintenanceScheduleStore implements MaintenanceScheduleRepository {
  private store = new Map<string, MaintenanceSchedule>();

  async create(input: CreateMaintenanceScheduleInput): Promise<MaintenanceSchedule> {
    const now = new Date().toISOString();
    const schedule: MaintenanceSchedule = {
      id: uuidv4(),
      areaId: input.areaId,
      title: input.title,
      description: input.description,
      frequencyDays: input.frequencyDays,
      nextDueDate: input.nextDueDate,
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(schedule.id, schedule);
    return { ...schedule };
  }

  async getAll(): Promise<MaintenanceSchedule[]> {
    return Array.from(this.store.values())
      .sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate))
      .map((s) => ({ ...s }));
  }

  async getById(id: string): Promise<MaintenanceSchedule | null> {
    const schedule = this.store.get(id);
    return schedule ? { ...schedule } : null;
  }

  async markCompleted(id: string, completedDate: string): Promise<MaintenanceSchedule> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`MaintenanceSchedule with id ${id} not found`);
    }

    const completed = new Date(completedDate);
    completed.setDate(completed.getDate() + existing.frequencyDays);
    const nextDueDate = completed.toISOString().split('T')[0]!;

    const updated: MaintenanceSchedule = {
      ...existing,
      lastCompletedDate: completedDate,
      nextDueDate,
      updatedAt: new Date().toISOString(),
    };
    this.store.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<void> {
    if (!this.store.has(id)) {
      throw new Error(`MaintenanceSchedule with id ${id} not found`);
    }
    this.store.delete(id);
  }

  reset(): void {
    this.store.clear();
  }
}
