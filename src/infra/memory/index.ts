import { InMemoryHomeEventStore } from './home-event-store';
import { InMemoryHomeAreaStore } from './home-area-store';
import { InMemoryEventPhotoStore } from './event-photo-store';
import { InMemoryPhotoUploader } from './photo-uploader';
import { InMemoryMaintenanceScheduleStore } from './maintenance-schedule-store';

export const inMemoryHomeEventStore = new InMemoryHomeEventStore();
export const inMemoryHomeAreaStore = new InMemoryHomeAreaStore();
export const inMemoryEventPhotoStore = new InMemoryEventPhotoStore();
export const inMemoryPhotoUploader = new InMemoryPhotoUploader();
export const inMemoryMaintenanceScheduleStore = new InMemoryMaintenanceScheduleStore();
