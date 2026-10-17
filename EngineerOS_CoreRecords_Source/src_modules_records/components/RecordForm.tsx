// src/modules/records/components/RecordForm.tsx - FIXED TO PRESERVE FILES

import React, { useState, useEffect } from 'react';
import { EngineeringRecord, RecordCategory, Discipline, RecordStatus } from '../domain/EngineeringRecord';
import { X, Save, FileText, Upload } from 'lucide-react';

interface RecordFormProps {
  record?: EngineeringRecord | null;
  projectId?: string;
  onSave: (data: any) => void;
  onClose: () => void;
}

export function RecordForm({ record, projectId, onSave, onClose }: RecordFormProps) {
  const isEditing = !!record;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other' as RecordCategory,
    discipline: 'other' as Discipline,
    status: 'draft' as RecordStatus,
  });

  // ✅ Track file changes
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentFileInfo, setCurrentFileInfo] = useState<{ name: string; size: number } | null>(null);

  useEffect(() => {
    if (record) {
      setFormData({
        title: record.title || '',
        description: record.description || '',
        category: record.category || 'other',
        discipline: record.discipline || 'other',
        status: record.status || 'draft',
      });
      // ✅ Preserve file info
      if (record.fileName) {
        setCurrentFileInfo({
          name: record.fileName,
          size: record.fileSize || 0,
        });
      }
    }
  }, [record]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setCurrentFileInfo({
        name: file.name,
        size: file.size,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ Preserve file data when editing
      const saveData = {
        ...formData,
        id: record?.id,
        projectId: record?.projectId || projectId,
        version: record?.version ? record.version + 1 : 1,
        revision: record?.revision || 'REV0',
        createdBy: record?.createdBy || 'current-user',
        updatedBy: 'current-user',
        // ✅ Include file data - preserve existing or use new file
        fileName: selectedFile?.name || record?.fileName || undefined,
        fileSize: selectedFile?.size || record?.fileSize || undefined,
        mimeType: selectedFile?.type || record?.mimeType || undefined,
        storageUrl: record?.storageUrl || undefined,
        fileId: record?.fileId || undefined,
        // ✅ Only upload file if new one selected
        file: selectedFile || undefined,
      };
      
      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isEditing ? '✏️ Edit Record' : '📄 Create New Record'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter record title"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description (optional)"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as RecordCategory })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Discipline
              </label>
              <select
                value={formData.discipline}
                onChange={(e) => setFormData({ ...formData, discipline: e.target.value as Discipline })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

          {isEditing && (
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as RecordStatus })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="draft">Draft</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="issued">Issued</option>
                <option value="superseded">Superseded</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}

          {/* ✅ File Section - Show current file and allow replacement */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
              File
            </label>
            
            {currentFileInfo && (
              <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg mb-2">
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">{currentFileInfo.name}</span>
                <span className="text-xs text-slate-400">({(currentFileInfo.size / 1024).toFixed(1)} KB)</span>
                <span className="text-xs text-emerald-500 ml-auto">✅ Current file</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition text-sm flex items-center gap-2">
                <Upload className="h-4 w-4" />
                {currentFileInfo ? 'Replace File' : 'Choose File'}
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {selectedFile && (
                <span className="text-sm text-emerald-500">✅ {selectedFile.name} selected</span>
              )}
              <span className="text-xs text-slate-400">Optional - keep current file if not replaced</span>
            </div>
          </div>

          {record && (
            <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <p>Current Version: v{record.version} ({record.revision})</p>
              <p>Created: {new Date(record.createdAt).toLocaleDateString()}</p>
              <p>Last Updated: {new Date(record.updatedAt).toLocaleDateString()}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : (isEditing ? 'Update Record' : 'Create Record')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
