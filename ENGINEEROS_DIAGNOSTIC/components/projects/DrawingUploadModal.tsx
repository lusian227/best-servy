// src/components/projects/DrawingUploadModal.tsx

import { StorageService } from "../../services/StorageService";
import React, { useState, useRef } from 'react';
import { X, Upload, Check, AlertCircle } from 'lucide-react';
import { useDrawingStore } from '../../stores';
import { useRecordStore } from '../../modules/records/store/recordStore';
import { RecordCategory, Discipline } from '../../modules/records/domain/EngineeringRecord';

interface DrawingUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (drawing: any) => void;
  projectId: string;
}

export function DrawingUploadModal({ isOpen, onClose, onSave, projectId }: DrawingUploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [drawingNumber, setDrawingNumber] = useState('');
  const [discipline, setDiscipline] = useState<Discipline>('structural');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { saveDrawing } = useDrawingStore();
  const { createRecord } = useRecordStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🔍 STEP 1: Form submitted");
    console.log("🔍 File:", file?.name);
    console.log("🔍 Title:", title);
    console.log("🔍 Drawing Number:", drawingNumber);

    if (!file) {
      console.log("❌ ERROR: No file selected");
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // ✅ FIX 1: Create preview URL once at the beginning


      // Upload to Supabase Storage
      const storageUrl = await StorageService.uploadFile(
        file,
        projectId
      );




      console.log("🔍 Storage URL:", storageUrl);

      // ✅ FIX 2: drawingData now includes fileUrl and metadata
      const drawingData = {
        id: 'draw-' + Date.now(),
        projectId,
        drawingNumber: drawingNumber || 'DWG-' + Date.now().toString().slice(-4),
        title: title || file.name,
        discipline: discipline || 'structural',
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: storageUrl,
        metadata: {
          storageUrl: storageUrl,
          mimeType: file.type,
          originalFileName: file.name,
          fileSize: file.size,
        },
        uploadedAt: new Date().toISOString(),
        uploader: 'Martin Vance',
        status: 'draft' as const,
        revision: 'REV0',
      };

      console.log("🔍 STEP 2: Drawing data created:", drawingData);

      // Save to drawings store
      console.log("🔍 STEP 3: Saving drawing...");
      await saveDrawing(drawingData);
      console.log("✅ Drawing saved successfully!");

      // ✅ FIX 3: Reuse previewUrl in recordInput
      const recordInput = {
        workspaceId: 'ws-001',
        workspaceType: 'project',
        title: title || file.name,
        description: 'Drawing: ' + drawingData.drawingNumber,
        recordType: 'drawing',
        category: 'drawing' as RecordCategory,
        discipline: discipline as Discipline,
        createdBy: 'Martin Vance',
        file: file,
        metadata: {
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          storageUrl: storageUrl,
          fileUrl: storageUrl,
          drawingNumber: drawingData.drawingNumber,
          projectId: projectId,
          uploader: 'Martin Vance',
          fileIds: ['file-' + Date.now()],
          tags: ['drawing', discipline.toLowerCase()],
        },
      };

      console.log("🔍 STEP 4: Record input created:", recordInput);

      // Save to Records store using createRecord
      console.log("🔍 STEP 5: Saving record...");
      const savedRecord = await createRecord(recordInput);
      console.log("✅ Record saved successfully:", savedRecord);

      setSuccess(true);
      onSave(drawingData);

      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFile(null);
        setTitle('');
        setDrawingNumber('');
        setUploading(false);
      }, 1500);

    } catch (err) {
      console.log("❌ STEP 7: ERROR occurred!");
      console.error("❌ Error details:", err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    }
  };

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name);
    }
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upload Drawing</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            disabled={uploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {success ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="text-lg font-medium text-slate-900 dark:text-white">Upload Complete!</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Drawing saved to project and records.</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="mt-2 text-sm text-emerald-600 hover:text-emerald-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* File Upload */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={"border-2 border-dashed rounded-xl p-6 text-center transition " + (dragOver ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-300 dark:border-slate-600')}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf,.svg"
                />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="text-left">
                      <p className="font-medium text-slate-900 dark:text-white">{file.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Drag & drop or click to browse
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      PDF, JPG, PNG, DWG, DXF, SVG
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition"
                    >
                      Select File
                    </button>
                  </div>
                )}
              </div>

              {/* Drawing Details */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Drawing Number</label>
                <input
                  type="text"
                  value={drawingNumber}
                  onChange={(e) => setDrawingNumber(e.target.value)}
                  placeholder="e.g., S-101"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Drawing title"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discipline</label>
                <select
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value as Discipline)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="structural">Structural</option>
                  <option value="architectural">Architectural</option>
                  <option value="mep">MEP</option>
                  <option value="civil">Civil</option>
                  <option value="geotechnical">Geotechnical</option>
                  <option value="surveying">Surveying</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!file || uploading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading ? 'Uploading...' : 'Upload Drawing'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}