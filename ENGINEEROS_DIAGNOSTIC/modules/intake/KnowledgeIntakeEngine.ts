// src/modules/intake/KnowledgeIntakeEngine.ts

import { EngineeringRecord } from '../../domain/records/EngineeringRecord';
import { StoredFile } from '../../domain/files/StoredFile';
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
  metadata?: Record<string, any>;
}

export class KnowledgeIntakeEngine {
  private recordService = new RecordService();

  async intake(file: File, context: IntakeContext): Promise<IntakeResult> {
    try {
      console.log('📥 Receiving:', file.name, '(', file.type, ')');

      const storedFile = await this.storeFile(file, context.workspaceId);

      const record = await this.recordService.create({
        workspaceId: context.workspaceId,
        workspaceType: 'project',
        title: context.title || file.name,
        description: context.description,
        category: 'other',
        discipline: 'other',
        recordType: 'other',
        createdBy: context.createdBy,
        metadata: {
          ...context.metadata,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          fileId: storedFile.id,
        },
      });

      let previewAvailable = false;
      let previewUrl: string | undefined;

      try {
        const preview = await this.generatePreview(file, record);
        if (preview) {
          previewAvailable = true;
          previewUrl = preview;
          console.log('👁️ Preview available');
        }
      } catch (error) {
        console.log('⚠️ Preview not available for:', file.name);
      }

      let extractedMetadata: Record<string, any> = {};
      try {
        extractedMetadata = await this.extractMetadata(file);
        if (Object.keys(extractedMetadata).length > 0) {
          await this.recordService.update(record.id, {
            metadata: { ...record.metadata, extracted: extractedMetadata },
            updatedBy: 'system',
          });
          console.log('📊 Metadata extracted:', Object.keys(extractedMetadata).join(', '));
        }
      } catch (error) {
        console.log('⚠️ Metadata extraction failed for:', file.name);
      }

      console.log('✅ Intake complete:', record.recordNumber);

      return {
        success: true,
        record,
        file: storedFile,
        previewAvailable,
        metadata: extractedMetadata,
      };

    } catch (error) {
      console.error('❌ Intake failed:', error);
      return {
        success: false,
        previewAvailable: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async storeFile(file: File, workspaceId: string): Promise<StoredFile> {
    const fileId = 'file-' + Date.now();
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

    const filePath =
      `${workspaceId}/${fileId}.${extension}`;
    const { data, error } = await supabase.storage
      .from('records')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error('Storage failed: ' + error.message);
    }

    const { data: urlData } = supabase.storage
      .from('records')
      .getPublicUrl(filePath);

    const buffer = await file.arrayBuffer();

    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      buffer
    );

    const checksum = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return {
      id: fileId,
      recordId: '',
      filename: file.name,
      mimeType: file.type,
      extension: file.name.split('.').pop()?.toLowerCase() || '',
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

  private async generatePreview(file: File, record: EngineeringRecord): Promise<string | null> {
    const type = file.type;
    const ext = file.name.split('.').pop()?.toLowerCase();

    const previewable = [
      'image/', 'application/pdf', 'video/', 'audio/',
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
      'pdf', 'mp4', 'webm', 'mov', 'mp3', 'wav',
    ].some(t => type.startsWith(t) || t === ext);

    if (!previewable) {
      return null;
    }

    if (type.startsWith('image/') || type === 'application/pdf') {
      const recordFiles = await this.recordService.getById(record.id);
      if (recordFiles && recordFiles.fileIds.length > 0) {
        return '/api/files/' + recordFiles.fileIds[0];
      }
    }

    return null;
  }

  private async extractMetadata(file: File): Promise<Record<string, any>> {
    const metadata: Record<string, any> = {};

    metadata.fileType = file.type;
    metadata.fileSize = file.size;
    metadata.extension = file.name.split('.').pop()?.toLowerCase();

    if (file.type.startsWith('image/')) {
      try {
        const img = new Image();
        const url = URL.createObjectURL(file);
        await new Promise((resolve) => {
          img.onload = () => {
            metadata.width = img.width;
            metadata.height = img.height;
            resolve(null);
          };
          img.onerror = resolve;
          img.src = url;
        });
        URL.revokeObjectURL(url);
      } catch (error) {
        console.log('Could not extract image dimensions');
      }
    }

    return metadata;
  }
}
