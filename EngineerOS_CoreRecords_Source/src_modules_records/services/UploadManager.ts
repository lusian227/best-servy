// src/modules/records/services/UploadManager.ts

import { UploadManager as CoreUploadManager } from '../../../core/storage/UploadManager';
import { RecordService } from './RecordService';
import type { CreateRecordInput } from '../domain/RecordDTO';

export class RecordsUploadManager {
    private uploadManager: CoreUploadManager;

    constructor(
        private readonly recordService: RecordService
    ) {
        this.uploadManager = new CoreUploadManager();
    }

    async createRecordWithFile(
        input: CreateRecordInput,
        file: File,
        userId: string
    ) {
        // Step 1: Upload the file
        const uploadResult = await this.uploadManager.uploadFile(file, `records/${input.projectId}`);

        // Step 2: Create the record
        const record = await this.recordService.create({
            ...input,
            createdBy: userId,
            metadata: {
                ...input.metadata,
                storageUrl: uploadResult.fileInfo.url,
                fileId: uploadResult.fileInfo.id,
                originalFileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                uploadPath: uploadResult.path,
            },
        });

        // Step 3: Attach the file to the record
        const updated = await this.recordService.attachFile(
            record.id,
            {
                fileId: uploadResult.fileInfo.id,
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                storageUrl: uploadResult.fileInfo.url,
                thumbnailUrl: uploadResult.fileInfo.thumbnailUrl,
            },
            userId
        );

        return updated || record;
    }

    async deleteFile(recordId: string, path: string): Promise<boolean> {
        return this.uploadManager.deleteFile(path);
    }
}