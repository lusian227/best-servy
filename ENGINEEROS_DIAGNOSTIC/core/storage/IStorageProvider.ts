// src/core/storage/IStorageProvider.ts

export interface IFileInfo {
    id: string;
    name: string;
    size: number;
    mimeType: string;
    url: string;
    thumbnailUrl?: string;
    checksum?: string;
}

export interface IStorageProvider {
    upload(file: File, path: string): Promise<IFileInfo>;
    delete(path: string): Promise<boolean>;
    getUrl(path: string): string;
    getThumbnailUrl(path: string): string;
    exists(path: string): Promise<boolean>;
}