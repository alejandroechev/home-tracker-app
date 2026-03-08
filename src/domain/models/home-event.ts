export const EVENT_TYPES = ['Reparación', 'Mantención', 'Proyecto'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const EVENT_STATUSES = ['not_started', 'in_progress', 'completed', 'cancelled'] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export interface HomeEvent {
  id: string;
  date: string;
  type: EventType;
  title: string;
  description: string;
  areaId: string;
  priority: Priority;
  status: EventStatus;
  materialsCost?: number;
  laborCost?: number;
  totalCost?: number;
  vendorName?: string;
  parentEventId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHomeEventInput {
  date: string;
  type: EventType;
  title: string;
  description: string;
  areaId: string;
  priority: Priority;
  materialsCost?: number;
  laborCost?: number;
  totalCost?: number;
  vendorName?: string;
  parentEventId?: string;
}

export interface UpdateHomeEventInput {
  date?: string;
  type?: EventType;
  title?: string;
  description?: string;
  areaId?: string;
  priority?: Priority;
  status?: EventStatus;
  materialsCost?: number;
  laborCost?: number;
  totalCost?: number;
  vendorName?: string;
}
