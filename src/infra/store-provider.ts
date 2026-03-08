import type {
  CreateHomeEventInput,
  UpdateHomeEventInput,
  HomeEvent,
  CreateHomeAreaInput,
  HomeArea,
  CreateEventPhotoInput,
  EventPhoto,
  CreateMaintenanceScheduleInput,
  MaintenanceSchedule,
} from '../domain/models';
import type { HomeEventFilters } from '../domain/services';
import {
  inMemoryHomeEventStore,
  inMemoryHomeAreaStore,
  inMemoryEventPhotoStore,
  inMemoryPhotoUploader,
  inMemoryMaintenanceScheduleStore,
} from './memory';

// TODO: check supabase client availability and switch implementations

// --- Home Events ---
export async function createEvent(input: CreateHomeEventInput): Promise<HomeEvent> {
  return inMemoryHomeEventStore.create(input);
}

export async function getEventById(id: string): Promise<HomeEvent | null> {
  return inMemoryHomeEventStore.getById(id);
}

export async function getAllEvents(filters?: HomeEventFilters): Promise<HomeEvent[]> {
  return inMemoryHomeEventStore.getAll(filters);
}

export async function updateEvent(id: string, input: UpdateHomeEventInput): Promise<HomeEvent> {
  return inMemoryHomeEventStore.update(id, input);
}

export async function deleteEvent(id: string): Promise<void> {
  return inMemoryHomeEventStore.delete(id);
}

// --- Home Areas ---
export async function createArea(input: CreateHomeAreaInput): Promise<HomeArea> {
  return inMemoryHomeAreaStore.create(input);
}

export async function getAllAreas(): Promise<HomeArea[]> {
  return inMemoryHomeAreaStore.getAll();
}

export async function getAreaById(id: string): Promise<HomeArea | null> {
  return inMemoryHomeAreaStore.getById(id);
}

export async function getAreaByName(name: string): Promise<HomeArea | null> {
  return inMemoryHomeAreaStore.getByName(name);
}

// --- Event Photos ---
export async function createPhoto(input: CreateEventPhotoInput): Promise<EventPhoto> {
  return inMemoryEventPhotoStore.create(input);
}

export async function getPhotosByEventId(eventId: string): Promise<EventPhoto[]> {
  return inMemoryEventPhotoStore.getByEventId(eventId);
}

export async function deletePhoto(id: string): Promise<void> {
  return inMemoryEventPhotoStore.delete(id);
}

// --- Photo Upload ---
export async function uploadPhoto(file: File): Promise<string> {
  return inMemoryPhotoUploader.upload(file);
}

export async function deleteUploadedPhoto(url: string): Promise<void> {
  return inMemoryPhotoUploader.delete(url);
}

// --- Maintenance Schedules ---
export async function createSchedule(input: CreateMaintenanceScheduleInput): Promise<MaintenanceSchedule> {
  return inMemoryMaintenanceScheduleStore.create(input);
}

export async function getAllSchedules(): Promise<MaintenanceSchedule[]> {
  return inMemoryMaintenanceScheduleStore.getAll();
}

export async function getScheduleById(id: string): Promise<MaintenanceSchedule | null> {
  return inMemoryMaintenanceScheduleStore.getById(id);
}

export async function markScheduleCompleted(id: string, completedDate: string): Promise<MaintenanceSchedule> {
  return inMemoryMaintenanceScheduleStore.markCompleted(id, completedDate);
}

export async function deleteSchedule(id: string): Promise<void> {
  return inMemoryMaintenanceScheduleStore.delete(id);
}
