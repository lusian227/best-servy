// src/domain/files/StoredFile.ts

export type FileType =
  | 'original'
  | 'converted'
  | 'thumbnail'
  | 'preview'
  | 'archive'
  | 'extracted';

export type FileProcessingStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'skipped';

export interface StoredFile {
  id: string;
  recordId: string;
  
  // File identity
  filename: string;
  mimeType: string;
  extension: string;
  size: number;  // bytes
  
  // Storage
  storageUrl: string;  // The permanent URL
  thumbnailUrl?: string;
  previewUrl?: string;
  
  // Integrity
  checksum: string;  // SHA-256 or similar
  
  // Classification
  isPrimary: boolean;
  fileType: FileType;
  
  // Processing
  processingStatus: FileProcessingStatus;
  processingError?: string;
  
  // Metadata
  metadata: FileMetadata;
  
  // Tracking
  uploadedBy: string;
  uploadedAt: Date;
}

export interface FileMetadata {
  // Image/PDF
  pageCount?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  dpi?: number;
  
  // Video/Audio
  duration?: number;
  bitrate?: number;
  
  // Compression
  compression?: string;
  colorSpace?: string;
  
  // OCR
  hasOcr: boolean;
  ocrText?: string;
  ocrConfidence?: number;
  
  // Extracted
  extractedText?: string;
  extractedMetadata?: Record<string, any>;
  
  // Custom
  custom: Record<string, any>;
}

export const fileTypeLabels: Record<FileType, string> = {
  original: 'Original File',
  converted: 'Converted',
  thumbnail: 'Thumbnail',
  preview: 'Preview',
  archive: 'Archive',
  extracted: 'Extracted',
};

export const processingStatusLabels: Record<FileProcessingStatus, string> = {
  pending: 'Pending',
  processing: 'Processing...',
  completed: 'Completed',
  failed: 'Failed',
  skipped: 'Skipped',
};
