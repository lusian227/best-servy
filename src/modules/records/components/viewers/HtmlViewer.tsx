// src/modules/records/components/viewers/HtmlViewer.tsx

import React, { useState, useEffect } from 'react';
import { Download, X, Eye, ExternalLink } from 'lucide-react';

interface HtmlViewerProps {
  fileUrl: string;
  fileName?: string;
  onClose?: () => void;
  onDownload?: () => void;
}

export function HtmlViewer({ fileUrl, fileName, onClose, onDownload }: HtmlViewerProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHtml = async () => {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error('Failed to load HTML file');
        const html = await response.text();
        setHtmlContent(html);
        setLoading(false);
      } catch (err) {
        setError('Failed to load HTML content. You can download the file instead.');
        setLoading(false);
      }
    };
    fetchHtml();
  }, [fileUrl]);

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <h3 className="font-medium text-slate-900 dark:text-white">{fileName || 'HTML Viewer'}</h3>
          <span className="text-xs text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">HTML</span>
          {loading && <span className="text-sm text-slate-500">Loading...</span>}
        </div>
        <div className="flex items-center gap-2">
          {onDownload && (
            <button
              onClick={onDownload}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
              title="Download"
            >
              <Download className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          )}
          <button
            onClick={() => window.open(fileUrl, '_blank')}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
            title="Open in new tab"
          >
            <ExternalLink className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
            title="Close"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex-1 flex items-center justify-center text-center p-8">
          <div>
            <div className="text-5xl mb-4">📄</div>
            <p className="text-red-500 mb-2">{error}</p>
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

      {/* HTML Viewer */}
      {!error && (
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-900 z-10">
              <div className="text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto mb-4" />
                <p className="text-slate-500">Loading HTML...</p>
              </div>
            </div>
          )}
          {htmlContent && (
            <iframe
              srcDoc={htmlContent}
              className="w-full h-full border-0 bg-white"
              title={fileName || 'HTML Viewer'}
              sandbox="allow-scripts allow-modals allow-same-origin"
              loading="lazy"
            />
          )}
        </div>
      )}
    </div>
  );
}
