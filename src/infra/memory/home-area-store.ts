import { v4 as uuidv4 } from 'uuid';
import type { HomeArea, CreateHomeAreaInput } from '../../domain/models';
import type { HomeAreaRepository } from '../../domain/services';

export class InMemoryHomeAreaStore implements HomeAreaRepository {
  private store = new Map<string, HomeArea>();

  async create(input: CreateHomeAreaInput): Promise<HomeArea> {
    const area: HomeArea = {
      id: uuidv4(),
      name: input.name,
      createdAt: new Date().toISOString(),
    };
    this.store.set(area.id, area);
    return { ...area };
  }

  async getAll(): Promise<HomeArea[]> {
    return Array.from(this.store.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((a) => ({ ...a }));
  }

  async getById(id: string): Promise<HomeArea | null> {
    const area = this.store.get(id);
    return area ? { ...area } : null;
  }

  async getByName(name: string): Promise<HomeArea | null> {
    const lowerName = name.toLowerCase();
    for (const area of this.store.values()) {
      if (area.name.toLowerCase() === lowerName) {
        return { ...area };
      }
    }
    return null;
  }

  reset(): void {
    this.store.clear();
  }
}
