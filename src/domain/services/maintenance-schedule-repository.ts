import type { MaintenanceSchedule, CreateMaintenanceScheduleInput } from '../models';

export interface MaintenanceScheduleRepository {
  create(input: CreateMaintenanceScheduleInput): Promise<MaintenanceSchedule>;
  getAll(): Promise<MaintenanceSchedule[]>;
  getById(id: string): Promise<MaintenanceSchedule | null>;
  markCompleted(id: string, completedDate: string): Promise<MaintenanceSchedule>;
  delete(id: string): Promise<void>;
}
