// src/modules/records/components/UploadCenter.tsx

import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, FileText, FileCode, CheckCircle, AlertCircle } from 'lucide-react';
import { useRecord } from '../hooks/useRecord';
import { CreateRecordInput } from '../services/RecordService';
import { supabase } from '../../../lib/supabase';

interface UploadCenterProps {
  workspaceId: string;
  projectId: string;
  onUploadComplete?: (recordId: string) => void;
  onClose?: () => void;
}

export function UploadCenter({ projectId, onUploadComplete, onClose }: UploadCenterProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'drawing' | 'specification' | 'report' | 'photo' | 'calculation' | 'rfi' | 'contract' | 'other'>('other');
  const [discipline, setDiscipline] = useState<'structural' | 'architectural' | 'mep' | 'civil' | 'geotechnical' | 'other'>('other');
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createRecord, uploadFile } = useRecord();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
    setError(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type === 'application/pdf') return <FileText className="w-5 h-5" />;
    if (ext === 'html' || ext === 'htm') return <FileCode className="w-5 h-5" />;
    if (['xlsx', 'xls', 'docx', 'doc', 'pptx', 'ppt', 'csv'].includes(ext)) return <FileText className="w-5 h-5" />;
    if (type.includes('dwg') || type.includes('dxf')) return <FileCode className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const uploadToSupabase = async (file: File, recordId: string): Promise<string | null> => {
    try {
      const filePath = `uploads/${recordId}/${Date.now()}_${file.name}`;

      const { data, error } = await supabase.storage
        .from('records')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('records')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    setUploadSuccess(false);

    try {
      console.log("========== UploadCenter ==========");
      console.log("projectId prop:", projectId);
      console.log("Files to upload:", files.length);

      setProgress(10);

      let lastRecordId: string | null = null;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        console.log(`📤 Uploading file ${i + 1}/${files.length}:`, file.name);

        const input: CreateRecordInput = {
          projectId: projectId,
          workspaceId: projectId,
          workspaceType: "project",
          title: title.trim() || file.name,
          description: description.trim() || undefined,
          recordType: category,
          category: category,
          discipline: discipline,
          createdBy: "current-user",
          metadata: {
            projectId,
            originalFileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
          }
        };

        const record = await createRecord(input);
        if (!record) {
          setError(`Failed to create record for ${file.name}`);
          setUploading(false);
          return;
        }

        lastRecordId = record.id;

        console.log(`✅ Record created: ${record.id}`);

        const publicUrl = await uploadToSupabase(file, record.id);
        if (!publicUrl) {
          setError('Failed to upload file: ' + file.name);
          setUploading(false);
          return;
        }

        console.log(`🔍 PUBLIC URL:`, publicUrl);

        await uploadFile(record.id, file, publicUrl);

        // Verify it was saved
        const { data } = await supabase
          .from("records")
          .select("storage_url, mime_type")
          .eq("id", record.id)
          .single();
        console.log(`🔍 DATABASE AFTER SAVE for ${file.name}:`, data);

        setProgress(10 + ((i + 1) / files.length) * 80);

        // ✅ Call onUploadComplete HERE (inside the loop)
        if (onUploadComplete) {
          onUploadComplete(record.id);
        }
      }

      setProgress(100);
      setUploadSuccess(true);

      setTimeout(() => {
        setFiles([]);
        setTitle('');
        setDescription('');
        setUploading(false);
        if (onClose) onClose();
      }, 1500);

    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upload Files</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {uploadSuccess && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Upload successful! Closing...
          </div>
        )}

        <div className="space-y-4 mb-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter record title"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={uploading}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description (optional)"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={uploading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={uploading}
              >
                <option value="drawing">Drawing</option>
                <option value="specification">Specification</option>
                <option value="report">Report</option>
                <option value="photo">Photo</option>
                <option value="calculation">Calculation</option>
                <option value="rfi">RFI</option>
                <option value="contract">Contract</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Discipline</label>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={uploading}
              >
                <option value="structural">Structural</option>
                <option value="architectural">Architectural</option>
                <option value="mep">MEP</option>
                <option value="civil">Civil</option>
                <option value="geotechnical">Geotechnical</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center transition
            ${isDragging
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
              : 'border-slate-300 dark:border-slate-700'
            }
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <p className="text-slate-600 dark:text-slate-400">Drag & drop files here or</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            disabled={uploading}
          >
            Browse Files
          </button>
          <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
          <p className="text-xs text-slate-400 mt-2">
            Supported: PDF, DWG, DXF, JPG, PNG, HTML, Excel, Word, PowerPoint (Max 100MB)
          </p>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{files.length} file(s) selected</p>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  {getFileIcon(file)}
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button onClick={() => removeFile(index)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition" disabled={uploading}>
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div className="bg-emerald-600 h-2 rounded-full transition-all duration-300" style={{ width: progress + '%' }} />
            </div>
            <p className="text-sm text-slate-500 mt-1">Uploading... {Math.round(progress)}%</p>
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading || !title.trim()}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload ' + files.length + ' file(s)'}
          </button>
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition" disabled={uploading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}