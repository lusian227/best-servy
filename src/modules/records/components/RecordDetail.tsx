// src/modules/records/components/RecordDetail.tsx

import React, { useState } from 'react';
import { EngineeringRecord } from '../domain/EngineeringRecord';
import { ViewerFactory } from '../viewers/ViewerFactory';
import {
  Eye,
  Download,
  X,
  Trash2,
  Loader2,
  FileText,
  Calendar,
  User,
  Tag,
  FolderOpen,
  Layers,
  Hash,
  Clock,
  Info,
} from 'lucide-react';

interface RecordDetailProps {
  record: EngineeringRecord | null;
  onClose?: () => void;
  onDownload?: () => void;
  onDelete?: (record: EngineeringRecord) => Promise<void> | void;
}

export function RecordDetail({
  record,
  onClose,
  onDownload,
  onDelete,
}: RecordDetailProps) {
  const [showViewer, setShowViewer] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!record) {
    return (
      <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
        Select a record to view details
      </div>
    );
  }

  const handleViewFile = () => {
    setShowViewer(true);
  };

  const handleDelete = async () => {
    if (!onDelete) {
      console.warn('RecordDetail: onDelete was not provided');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${record.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);

      console.log('??? RecordDetail: deleting record:', record.id);

      await onDelete(record);

      console.log('? RecordDetail: delete completed:', record.id);
    } catch (error) {
      console.error(
        '? RecordDetail: delete failed:',
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : 'Failed to delete record.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const tags = record.tags || [];
  const fileIds = record.fileIds || [];
  const metadata = record.metadata || {};

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">

        <div className="flex items-start justify-between gap-3">

          <div className="min-w-0 flex-1">

            <div className="flex items-center gap-2">
              <FileText size={16} className="text-emerald-500" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                {record.title}
              </h3>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {record.recordNumber || 'N/A'}
              </p>
              {record.projectId && (
                <span className="text-xs text-blue-500 font-mono">
                  • Project: {record.projectId.slice(0, 8)}...
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {record.status || 'draft'}
              </span>
              {record.category && (
                <span className="inline-flex px-2 py-0.5 rounded-md text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                  {record.category}
                </span>
              )}
              {record.discipline && (
                <span className="inline-flex px-2 py-0.5 rounded-md text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                  {record.discipline}
                </span>
              )}
            </div>

          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
              title="Close"
            >
              <X size={18} />
            </button>
          )}

        </div>


        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="flex items-center gap-2 mt-4">

          {fileIds.length > 0 && (
            <button
              type="button"
              onClick={handleViewFile}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm transition"
            >
              <Eye size={15} />
              View
            </button>
          )}

          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition"
            >
              <Download size={15} />
              Download
            </button>
          )}

          {/* =================================================
              DELETE BUTTON
          ================================================= */}

          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm transition ml-auto"
            >
              {isDeleting ? (
                <>
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={15} />
                  Delete
                </>
              )}
            </button>
          )}

        </div>

      </div>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Description */}
        {record.description && (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Description
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {record.description}
            </p>
          </div>
        )}


        {/* DETAILS GRID */}
        <div className="grid grid-cols-2 gap-3">

          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              Category
            </h4>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-0.5">
              {record.category || 'Uncategorized'}
            </p>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              Discipline
            </h4>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-0.5">
              {record.discipline || 'Other'}
            </p>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              Version
            </h4>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-0.5">
              v{record.version || 1}
            </p>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              Files
            </h4>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-0.5">
              {fileIds.length}
            </p>
          </div>

          {record.projectId && (
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 col-span-2">
              <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Project ID
              </h4>
              <p className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                {record.projectId}
              </p>
            </div>
          )}

          {record.workspaceId && (
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 col-span-2">
              <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Workspace ID
              </h4>
              <p className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                {record.workspaceId}
              </p>
            </div>
          )}

        </div>


        {/* TAGS */}
        {tags.length > 0 && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">

            <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Tags
            </h4>

            <div className="flex flex-wrap gap-1.5">

              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                >
                  #{tag}
                </span>
              ))}

            </div>

          </div>
        )}


        {/* METADATA */}
        {Object.keys(metadata).length > 0 && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">

            <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Metadata
            </h4>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">

              <pre className="text-xs text-slate-600 dark:text-slate-400 overflow-auto max-h-32 font-mono">
                {JSON.stringify(metadata, null, 2)}
              </pre>

            </div>

          </div>
        )}


        {/* TIMELINE */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">

          <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Timeline
          </h4>

          <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">

            <div className="flex items-center gap-2">
              <Calendar size={12} className="text-slate-400" />
              <span>
                Created:{' '}
                {record.createdAt
                  ? new Date(record.createdAt).toLocaleString()
                  : 'N/A'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock size={12} className="text-slate-400" />
              <span>
                Updated:{' '}
                {record.updatedAt
                  ? new Date(record.updatedAt).toLocaleString()
                  : 'N/A'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <User size={12} className="text-slate-400" />
              <span>
                Created By: {record.createdBy || 'Unknown'}
              </span>
            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          VIEWER
      ===================================================== */}

      {showViewer && (
        <ViewerFactory
          fileUrl={record.storageUrl || ''}
          fileName={record.fileName || 'file'}
          mimeType={record.mimeType ?? undefined}
          fileSize={record.fileSize ?? undefined}
          onClose={() => setShowViewer(false)}
          onDownload={onDownload}
        />
      )}

    </div>
  );
}
