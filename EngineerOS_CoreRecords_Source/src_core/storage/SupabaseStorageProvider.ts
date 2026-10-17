// src/core/storage/SupabaseStorageProvider.ts

import { supabase } from '../../lib/supabase';
import { IStorageProvider, IFileInfo } from './IStorageProvider';

export class SupabaseStorageProvider implements IStorageProvider {
    constructor(private readonly bucket: string = 'records') { }

    async upload(file: File, path: string): Promise<IFileInfo> {
        const { error } = await supabase.storage
            .from(this.bucket)
            .upload(path, file, { cacheControl: '3600', upsert: false });

        if (error) throw new Error(`Upload failed: ${error.message}`);

        const { data: urlData } = supabase.storage
            .from(this.bucket)
            .getPublicUrl(path);

        return {
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            mimeType: file.type,
            url: urlData.publicUrl,
            thumbnailUrl: file.type.startsWith('image/') ? urlData.publicUrl : undefined,
            checksum: await this.computeChecksum(file),
        };
    }

    async delete(path: string): Promise<boolean> {
        const { error } = await supabase.storage
            .from(this.bucket)
            .remove([path]);
        return !error;
    }

    getUrl(path: string): string {
        const { data } = supabase.storage
            .from(this.bucket)
            .getPublicUrl(path);
        return data.publicUrl;
    }

    getThumbnailUrl(path: string): string {
        return this.getUrl(path);
    }

    async exists(path: string): Promise<boolean> {
        try {
            const { data, error } = await supabase.storage
                .from(this.bucket)
                .list(path);
            return !error && data?.length > 0;
        } catch {
            return false;
        }
    }

    private async computeChecksum(file: File): Promise<string> {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
}