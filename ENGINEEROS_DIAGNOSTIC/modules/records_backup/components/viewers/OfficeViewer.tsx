// src/modules/records/components/viewers/OfficeViewer.tsx

import React, { useState } from 'react';
import { Download, X, FileText, Eye, ExternalLink } from 'lucide-react';

interface OfficeViewerProps {
  fileUrl: string;
  fileName?: string;
  onClose?: () => void;
  onDownload?: () => void;
}

export function OfficeViewer({ fileUrl, fileName, onClose, onDownload }: OfficeViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use Microsoft Office Online Viewer
  const getOfficeViewerUrl = (url: string) => {
    // Encode the URL for the viewer
    const encodedUrl = encodeURIComponent(url);
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
  };

  const viewerUrl = getOfficeViewerUrl(fileUrl);

  const getFileType = (name: string = '') => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const types: Record<string, string> = {
      xlsx: 'Excel Spreadsheet',
      xls: 'Excel Spreadsheet',
      csv: 'CSV File',
      docx: 'Word Document',
      doc: 'Word Document',
      pptx: 'PowerPoint Presentation',
      ppt: 'PowerPoint Presentation',
      pdf: 'PDF Document',
    };
    return types[ext] || 'Office Document';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-700">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-emerald-400" />
          <h3 className="font-medium">{fileName || 'Office Document'}</h3>
          <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            {getFileType(fileName)}
          </span>
          {loading && <span className="text-sm text-slate-400">Loading...</span>}
        </div>
        <div className="flex items-center gap-2">
          {onDownload && (
            <button
              onClick={onDownload}
              className="p-2 hover:bg-slate-700 rounded-lg transition"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => window.open(fileUrl, '_blank')}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
            title="Open in new tab"
          >
            <ExternalLink className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex-1 flex items-center justify-center text-white">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">📄</div>
            <p className="text-red-400 mb-2">⚠️ {error}</p>
            <p className="text-slate-400 text-sm">You can still download the file.</p>
            {onDownload && (
              <button
                onClick={onDownload}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                <Download className="h-4 w-4 inline mr-2" />
                Download File
              </button>
            )}
          </div>
        </div>
      )}

      {/* Office Viewer */}
      {!error && (
        <div className="flex-1 flex flex-col">
          {/* Loading indicator */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="text-center text-white">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto mb-4" />
                <p>Loading document...</p>
              </div>
            </div>
          )}

          <iframe
            src={viewerUrl}
            className="w-full h-full"
            title={fileName || 'Office Document'}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError('Unable to preview this document. You can download it instead.');
            }}
            allowFullScreen
          />

          {/* Fallback if iframe fails */}
          <div className="p-4 bg-slate-800 border-t border-slate-700 flex items-center justify-between">
            <span className="text-sm text-slate-400">
              <Eye className="h-4 w-4 inline mr-2" />
              Preview may not work for all file types
            </span>
            {onDownload && (
              <button
                onClick={onDownload}
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm"
              >
                <Download className="h-3 w-3 inline mr-1" />
                Download Original
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
