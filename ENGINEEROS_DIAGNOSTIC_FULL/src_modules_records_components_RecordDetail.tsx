// src/modules/records/components/RecordDetail.tsx

import React, { useState } from 'react';
import { EngineeringRecord } from '../../../domain/records/EngineeringRecord';
import { ViewerFactory } from '../viewers/ViewerFactory';
import { Eye, Download, X } from 'lucide-react';

interface RecordDetailProps {
  record: EngineeringRecord | null;
  onClose?: () => void;
  onDownload?: () => void;
}

export function RecordDetail({ record, onClose, onDownload }: RecordDetailProps) {
  const [showViewer, setShowViewer] = useState(false);

  if (!record) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500 dark:text-slate-400">
        Select a record to view details
      </div>
    );
  }

  const handleViewFile = () => {
    setShowViewer(true);
  };

  // Safe access helpers
  const tags = record.tags || [];
  const fileIds = record.fileIds || [];
  const metadata = record.metadata || {};

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{record.title}</h3>
          <span className="inline-block px-2 py-0.5 text-xs rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {record.recordNumber || 'N/A'}
          </span>
          <span className="inline-block px-2 py-0.5 text-xs rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            {record.status || 'draft'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {fileIds.length > 0 && (
            <button
              onClick={handleViewFile}
              className="px-3 py-1 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              View
            </button>
          )}
          {onDownload && (
            <button
              onClick={onDownload}
              className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {record.description && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">{record.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300">Category</h4>
            <p className="text-slate-600 dark:text-slate-400">{record.category || 'Uncategorized'}</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300">Discipline</h4>
            <p className="text-slate-600 dark:text-slate-400">{record.discipline || 'Other'}</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300">Version</h4>
            <p className="text-slate-600 dark:text-slate-400">v{record.version || 1}</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300">Files</h4>
            <p className="text-slate-600 dark:text-slate-400">{fileIds.length}</p>
          </div>
        </div>

        {/* Tags - Safe check */}
        {tags.length > 0 && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags</h4>
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metadata - Safe check */}
        {Object.keys(metadata).length > 0 && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Metadata</h4>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
              <pre className="text-xs text-slate-600 dark:text-slate-400 overflow-auto max-h-32">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Timeline</h4>
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <div>Created: {record.createdAt ? new Date(record.createdAt).toLocaleString() : 'N/A'}</div>
            <div>Updated: {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : 'N/A'}</div>
            <div>Created By: {record.createdBy || 'Unknown'}</div>
          </div>
        </div>
      </div>

      {/* Viewer Modal */}
      {showViewer && (
        <ViewerFactory
          fileUrl={record.storageUrl || ''}
          fileName={record.fileName || 'file'}
          mimeType={record.mimeType}
          fileSize={record.fileSize}
          onClose={() => setShowViewer(false)}
          onDownload={onDownload}
        />
      )}
    </div>
  );
}
