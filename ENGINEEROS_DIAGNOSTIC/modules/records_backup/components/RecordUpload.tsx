// src/modules/records/components/RecordUpload.tsx

import React, { useState, useRef } from 'react';
import { KnowledgeIntakeEngine } from '../../intake/KnowledgeIntakeEngine';
import { Upload, X, Check, AlertCircle } from 'lucide-react';

interface RecordUploadProps {
  workspaceId: string;
  parentType: 'workspace' | 'workItem';
  parentId: string;
  onUploadComplete?: (record: any) => void;
  onClose?: () => void;
}

const intakeEngine = new KnowledgeIntakeEngine();

export function RecordUpload({ workspaceId, parentType, parentId, onUploadComplete, onClose }: RecordUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setProgress(10);
    setError(null);
    setSuccess(false);

    try {
      setProgress(30);

      const result = await intakeEngine.intake(file, {
        workspaceId,
        parentType,
        parentId,
        title: file.name,
        createdBy: 'user',
        metadata: {
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
        },
      });

      setProgress(100);

      if (result.success) {
        setSuccess(true);
        if (onUploadComplete) {
          onUploadComplete(result.record);
        }
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upload Record</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="text-lg font-medium text-slate-900 dark:text-white">Upload Complete!</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your record has been saved.</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h4 className="text-lg font-medium text-slate-900 dark:text-white">Upload Failed</h4>
              <p className="text-sm text-red-600 dark:text-red-400 text-center mt-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-4 px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={"border-2 border-dashed rounded-xl p-8 text-center transition " + (dragOver ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-300 dark:border-slate-600')}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <div className="flex flex-col items-center">
                  <Upload className={"w-12 h-12 mb-3 " + (dragOver ? 'text-emerald-500' : 'text-slate-400')} />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {dragOver ? 'Drop your file here' : 'Drag and drop your file, or'}
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition"
                    disabled={uploading}
                  >
                    Browse Files
                  </button>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
                    Supports any file type. Preview where available.
                  </p>
                </div>
              </div>

              {uploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                      style={{ width: progress + '%' }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {!success && !error && (
          <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              disabled={uploading}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
