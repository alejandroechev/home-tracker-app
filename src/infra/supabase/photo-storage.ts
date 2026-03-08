import type { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const BUCKET = 'event-photos';

export class SupabasePhotoStorage {
  constructor(private readonly client: SupabaseClient) {}

  async upload(file: File): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${uuidv4()}.${ext}`;

    const { error } = await this.client.storage
      .from(BUCKET)
      .upload(path, file);

    if (error) throw new Error(`Failed to upload photo: ${error.message}`);

    const { data } = this.client.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  async delete(url: string): Promise<void> {
    const path = url.split(`/${BUCKET}/`).pop();
    if (!path) return;

    const { error } = await this.client.storage
      .from(BUCKET)
      .remove([path]);

    if (error) throw new Error(`Failed to delete photo: ${error.message}`);
  }
}
