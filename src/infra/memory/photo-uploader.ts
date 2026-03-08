import { v4 as uuidv4 } from 'uuid';

export class InMemoryPhotoUploader {
  async upload(_file: File): Promise<string> {
    return `memory://photos/${uuidv4()}.jpg`;
  }

  async delete(_url: string): Promise<void> {
    // no-op for in-memory implementation
  }
}
