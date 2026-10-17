// src/core/storage/UploadManager.ts

import { IStorageProvider, IFileInfo } from './IStorageProvider';
import { SupabaseStorageProvider } from './SupabaseStorageProvider';

export interface UploadResult {
    fileInfo: IFileInfo;
    path: string;
}

export class UploadManager {
    constructor(
        private readonly storage: IStorageProvider = new SupabaseStorageProvider()
    ) { }

    async uploadFile(file: File, folder: string = 'uploads'): Promise<UploadResult> {
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '_');
        const path = `${folder}/${timestamp}_${sanitizedName}`;

        const fileInfo = await this.storage.upload(file, path);

        return { fileInfo, path };
    }

    async deleteFile(path: string): Promise<boolean> {
        return this.storage.delete(path);
    }

    getFileUrl(path: string): string {
        return this.storage.getUrl(path);
    }

    getThumbnailUrl(path: string): string {
        return this.storage.getThumbnailUrl(path);
    }
}