export interface MaintenanceSchedule {
  id: string;
  areaId: string;
  title: string;
  description?: string;
  frequencyDays: number;
  lastCompletedDate?: string;
  nextDueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaintenanceScheduleInput {
  areaId: string;
  title: string;
  description?: string;
  frequencyDays: number;
  nextDueDate: string;
}
