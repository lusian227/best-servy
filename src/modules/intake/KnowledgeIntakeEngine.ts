
import type { EngineeringRecord } from '../records/domain/EngineeringRecord';
import type { StoredFile } from '../records/domain';
import { RecordService } from '../records/services/RecordService';
import { supabase } from '../../lib/supabase';

export interface IntakeResult {
  success: boolean;
  record?: EngineeringRecord;
  file?: StoredFile;
  previewAvailable: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface IntakeContext {
  workspaceId: string;
  parentType: 'workspace' | 'workItem';
  parentId: string;
  title?: string;
  description?: string;
  createdBy: string;
  updatedBy?: string;
  metadata?: Record<string, any>;
}

export class KnowledgeIntakeEngine {
  private recordService = new RecordService();

  async intake(
    file: File,
    context: IntakeContext
  ): Promise<IntakeResult> {
    try {
      console.log('Receiving file:', file.name, file.type);

      // 1. Upload the original file to Supabase Storage.
      const storedFile = await this.storeFile(
        file,
        context.workspaceId
      );

      // 2. Create the engineering record.
      const record = await this.recordService.create({
        workspaceId: context.workspaceId,
        title: context.title || file.name,
        description: context.description,
        category: 'other',
        discipline: 'other',
        createdBy: context.createdBy,
        updatedBy: context.updatedBy ?? context.createdBy,
        metadata: {
          ...context.metadata,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          fileId: storedFile.id,
        },
      });

      // 3. Link the uploaded file to the record.
      // This saves storage_url and the file details in the database.
      const storagePath =
        `${context.workspaceId}/${storedFile.id}.${storedFile.extension}`;

      const recordWithFile =
        await this.recordService.uploadFile(
          record.id,
          file,
          storedFile.storageUrl,
          context.createdBy,
          storagePath
        );

      // 4. Check whether this file type supports the viewer.
      let previewAvailable = false;

      try {
        const preview = await this.generatePreview(
          file,
          recordWithFile
        );

        previewAvailable = Boolean(preview);

        if (previewAvailable) {
          console.log('Preview available:', file.name);
        }
      } catch (error) {
        console.warn(
          'Preview check failed:',
          file.name,
          error
        );
      }

      // 5. Extract file metadata.
      let extractedMetadata: Record<string, any> = {};
      let finalRecord = recordWithFile;

      try {
        extractedMetadata = await this.extractMetadata(file);

        if (Object.keys(extractedMetadata).length > 0) {
          const updatedRecord =
            await this.recordService.update(record.id, {
              metadata: {
                ...recordWithFile.metadata,
                extracted: extractedMetadata,
              },
              updatedBy: context.updatedBy ?? context.createdBy,
            });

          if (updatedRecord) {
            finalRecord = updatedRecord;
          }

          console.log(
            'Metadata extracted:',
            Object.keys(extractedMetadata).join(', ')
          );
        }
      } catch (error) {
        console.warn(
          'Metadata extraction failed:',
          file.name,
          error
        );
      }

      console.log(
        'Intake complete:',
        finalRecord.recordNumber
      );

      return {
        success: true,
        record: finalRecord,
        file: storedFile,
        previewAvailable,
        metadata: extractedMetadata,
      };

    } catch (error) {
      console.error('Intake failed:', error);

      return {
        success: false,
        previewAvailable: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      };
    }
  }

  // ============================================================
  // STORE FILE IN SUPABASE
  // ============================================================

  private async storeFile(
    file: File,
    workspaceId: string
  ): Promise<StoredFile> {
    const fileId = 'file-' + Date.now();
    const versionId = `v${Date.now()}`;

    const extension =
      file.name.split('.').pop()?.toLowerCase() ?? '';

    const filePath =
      `${workspaceId}/${fileId}.${extension}`;

    const { error } = await supabase.storage
      .from('records')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(
        'Storage failed: ' + error.message
      );
    }

    const { data: urlData } = supabase.storage
      .from('records')
      .getPublicUrl(filePath);

    if (!urlData.publicUrl) {
      throw new Error(
        'Could not generate the file storage URL.'
      );
    }

    // Generate SHA-256 checksum.
    const buffer = await file.arrayBuffer();

    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      buffer
    );

    const checksum = Array.from(
      new Uint8Array(hashBuffer)
    )
      .map(byte =>
        byte.toString(16).padStart(2, '0')
      )
      .join('');

    return {
      id: fileId,
      recordId: '',
      versionId,
      filename: file.name,
      mimeType: file.type,
      extension,
      size: file.size,
      storageUrl: urlData.publicUrl,
      checksum,
      isPrimary: true,
      fileType: 'original',
      processingStatus: 'pending',
      metadata: {
        hasOcr: false,
        custom: {},
      },
      uploadedBy: 'system',
      uploadedAt: new Date(),
    };
  }

  // ============================================================
  // CHECK PREVIEW SUPPORT
  // ============================================================

  private async generatePreview(
    file: File,
    record: EngineeringRecord
  ): Promise<string | null> {
    const type = file.type.toLowerCase();

    const extension =
      file.name.split('.').pop()?.toLowerCase() ?? '';

    const supportedExtensions = [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'svg',
      'bmp',
      'pdf',
      'mp4',
      'webm',
      'mov',
      'avi',
      'mp3',
      'wav',
      'ogg',
    ];

    const supportedMimeType =
      type.startsWith('image/') ||
      type === 'application/pdf' ||
      type.startsWith('video/') ||
      type.startsWith('audio/');

    const supportedExtension =
      supportedExtensions.includes(extension);

    if (!supportedMimeType && !supportedExtension) {
      return null;
    }

    // Return the actual Supabase URL saved on the record.
    return record.storageUrl || null;
  }

  // ============================================================
  // EXTRACT FILE METADATA
  // ============================================================

  private async extractMetadata(
    file: File
  ): Promise<Record<string, any>> {
    const metadata: Record<string, any> = {};

    metadata.fileType = file.type;
    metadata.fileSize = file.size;
    metadata.extension =
      file.name.split('.').pop()?.toLowerCase();

    // Extract image dimensions.
    if (file.type.startsWith('image/')) {
      let objectUrl: string | undefined;

      try {
        const image = new Image();

        objectUrl = URL.createObjectURL(file);

        await new Promise<void>((resolve) => {
          image.onload = () => {
            metadata.width = image.width;
            metadata.height = image.height;
            resolve();
          };

          image.onerror = () => resolve();

          image.src = objectUrl!;
        });

      } catch (error) {
        console.warn(
          'Could not extract image dimensions:',
          error
        );
      } finally {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      }
    }

    return metadata;
  }
}
