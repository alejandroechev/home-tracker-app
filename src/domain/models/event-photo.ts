export interface EventPhoto {
  id: string;
  eventId: string;
  photoUrl: string;
  description?: string;
  createdAt: string;
}

export interface CreateEventPhotoInput {
  eventId: string;
  photoUrl: string;
  description?: string;
}
