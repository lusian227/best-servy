// src/modules/records/hooks/useFileUpload.ts

import {
  useState,
  useCallback,
} from 'react';

import { api } from './apiClient';
import { StoredFile } from '../domain/StoredFile';

export interface UseFileUploadReturn {
  uploading: boolean;
  progress: number;
  error: string | null;

  uploadFile: (
    recordId: string,
    file: File
  ) => Promise<StoredFile | null>;

  uploadMultiple: (
    recordId: string,
    files: File[]
  ) => Promise<StoredFile[]>;
}

export function useFileUpload(): UseFileUploadReturn {
  const [uploading, setUploading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [error, setError] =
    useState<string | null>(null);

  const uploadFile = useCallback(
    async (
      recordId: string,
      file: File
    ): Promise<StoredFile | null> => {
      let progressInterval:
        ReturnType<typeof setInterval> | undefined;

      try {
        setUploading(true);
        setError(null);
        setProgress(0);

        // Simulate upload progress.
        progressInterval = setInterval(() => {
          setProgress((prev) =>
            Math.min(prev + 10, 90)
          );
        }, 500);

        const response =
          await api.uploadFile<StoredFile>(
            `/records/${recordId}/files`,
            file
          );

        setProgress(100);

        if (
          response.success &&
          response.data
        ) {
          return response.data;
        }

        setError(
          response.error ||
          'Failed to upload file'
        );

        return null;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred'
        );

        return null;
      } finally {
        if (progressInterval) {
          clearInterval(
            progressInterval
          );
        }

        setUploading(false);
      }
    },
    []
  );

  const uploadMultiple = useCallback(
    async (
      recordId: string,
      files: File[]
    ): Promise<StoredFile[]> => {
      const results: StoredFile[] = [];

      for (const file of files) {
        const result =
          await uploadFile(
            recordId,
            file
          );

        if (result) {
          results.push(result);
        }
      }

      return results;
    },
    [uploadFile]
  );

  return {
    uploading,
    progress,
    error,
    uploadFile,
    uploadMultiple,
  };
}