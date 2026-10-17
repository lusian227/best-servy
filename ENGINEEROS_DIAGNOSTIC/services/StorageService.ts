// src/services/StorageService.ts

import { supabase } from "../lib/supabase";

export class StorageService {
  private static readonly BUCKET_NAME = "drawings";

  static async uploadFile(
    file: File,
    projectId: string
  ): Promise<string> {

    const timestamp = Date.now();
    const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${projectId}/${timestamp}_${sanitized}`;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log("===== CURRENT SESSION =====");
    console.log(session);

    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(path);
    console.log("===== STORAGE URL =====");
    console.log(data.publicUrl);

    return data.publicUrl;
  }

  static async deleteFile(url: string): Promise<void> {

    const marker = "/storage/v1/object/public/";

    const idx = url.indexOf(marker);

    if (idx === -1) return;

    const bucketPath = url.substring(idx + marker.length);

    const slash = bucketPath.indexOf("/");

    if (slash === -1) return;

    const path = bucketPath.substring(slash + 1);

    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([path]);

    if (error) {
      throw error;
    }
  }
}
