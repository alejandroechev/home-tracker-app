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
import type { HomeEventRepository } from '../domain/services';
import type { HomeAreaRepository } from '../domain/services';
import type { EventPhotoRepository } from '../domain/services';
import type { MaintenanceScheduleRepository } from '../domain/services';
import {
  inMemoryHomeEventStore,
  inMemoryHomeAreaStore,
  inMemoryEventPhotoStore,
  inMemoryPhotoUploader,
  inMemoryMaintenanceScheduleStore,
} from './memory';
import { supabase } from './supabase/client';
import { SupabaseHomeEventStore } from './supabase/home-event-store';
import { SupabaseHomeAreaStore } from './supabase/home-area-store';
import { SupabaseEventPhotoStore } from './supabase/event-photo-store';
import { SupabasePhotoStorage } from './supabase/photo-storage';
import { SupabaseMaintenanceScheduleStore } from './supabase/maintenance-schedule-store';

const eventStore: HomeEventRepository = supabase
  ? new SupabaseHomeEventStore(supabase)
  : inMemoryHomeEventStore;

const areaStore: HomeAreaRepository = supabase
  ? new SupabaseHomeAreaStore(supabase)
  : inMemoryHomeAreaStore;

const photoStore: EventPhotoRepository = supabase
  ? new SupabaseEventPhotoStore(supabase)
  : inMemoryEventPhotoStore;

const photoUploader = supabase
  ? new SupabasePhotoStorage(supabase)
  : inMemoryPhotoUploader;

const scheduleStore: MaintenanceScheduleRepository = supabase
  ? new SupabaseMaintenanceScheduleStore(supabase)
  : inMemoryMaintenanceScheduleStore;

// --- Home Events ---
export async function createEvent(input: CreateHomeEventInput): Promise<HomeEvent> {
  return eventStore.create(input);
}

export async function getEventById(id: string): Promise<HomeEvent | null> {
  return eventStore.getById(id);
}

export async function getAllEvents(filters?: HomeEventFilters): Promise<HomeEvent[]> {
  return eventStore.getAll(filters);
}

export async function updateEvent(id: string, input: UpdateHomeEventInput): Promise<HomeEvent> {
  return eventStore.update(id, input);
}

export async function deleteEvent(id: string): Promise<void> {
  return eventStore.delete(id);
}

// --- Home Areas ---
export async function createArea(input: CreateHomeAreaInput): Promise<HomeArea> {
  return areaStore.create(input);
}

export async function getAllAreas(): Promise<HomeArea[]> {
  return areaStore.getAll();
}

export async function getAreaById(id: string): Promise<HomeArea | null> {
  return areaStore.getById(id);
}

export async function getAreaByName(name: string): Promise<HomeArea | null> {
  return areaStore.getByName(name);
}

// --- Event Photos ---
export async function createPhoto(input: CreateEventPhotoInput): Promise<EventPhoto> {
  return photoStore.create(input);
}

export async function getPhotosByEventId(eventId: string): Promise<EventPhoto[]> {
  return photoStore.getByEventId(eventId);
}

export async function deletePhoto(id: string): Promise<void> {
  return photoStore.delete(id);
}

// --- Photo Upload ---
export async function uploadPhoto(file: File): Promise<string> {
  return photoUploader.upload(file);
}

export async function deleteUploadedPhoto(url: string): Promise<void> {
  return photoUploader.delete(url);
}

// --- Maintenance Schedules ---
export async function createSchedule(input: CreateMaintenanceScheduleInput): Promise<MaintenanceSchedule> {
  return scheduleStore.create(input);
}

export async function getAllSchedules(): Promise<MaintenanceSchedule[]> {
  return scheduleStore.getAll();
}

export async function getScheduleById(id: string): Promise<MaintenanceSchedule | null> {
  return scheduleStore.getById(id);
}

export async function markScheduleCompleted(id: string, completedDate: string): Promise<MaintenanceSchedule> {
  return scheduleStore.markCompleted(id, completedDate);
}

export async function deleteSchedule(id: string): Promise<void> {
  return scheduleStore.delete(id);
}
