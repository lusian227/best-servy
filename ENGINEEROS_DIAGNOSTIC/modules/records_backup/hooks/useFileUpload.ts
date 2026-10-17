// src/modules/records/hooks/useFileUpload.ts

import { useState, useCallback } from 'react';
import { api, ApiResponse } from './apiClient';
import { StoredFile } from '../domain/StoredFile';

export interface UseFileUploadReturn {
  uploading: boolean;
  progress: number;
  error: string | null;
  uploadFile: (recordId: string, file: File) => Promise<StoredFile | null>;
  uploadMultiple: (recordId: string, files: File[]) => Promise<StoredFile[]>;
}

export function useFileUpload(): UseFileUploadReturn {
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (recordId: string, file: File): Promise<StoredFile | null> => {
    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('recordId', recordId);
      formData.append('uploadedBy', 'current-user'); // In real app, get from auth

      const response = await api.uploadFile<StoredFile>(/records//files, file);

      clearInterval(progressInterval);
      setProgress(100);

      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Failed to upload file');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const uploadMultiple = useCallback(async (recordId: string, files: File[]): Promise<StoredFile[]> => {
    const results: StoredFile[] = [];
    
    for (const file of files) {
      const result = await uploadFile(recordId, file);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }, [uploadFile]);

  return {
    uploading,
    progress,
    error,
    uploadFile,
    uploadMultiple,
  };
}
