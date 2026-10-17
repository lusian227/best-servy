// src/modules/records/components/viewers/PDFViewer.tsx

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, X } from 'lucide-react';

// Set worker for PDF.js - Use the correct version from node_modules
// This loads the worker from the local node_modules folder
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PDFViewerProps {
  fileUrl: string;
  fileName?: string;
  onClose?: () => void;
  onDownload?: () => void;
}

export function PDFViewer({ fileUrl, fileName, onClose, onDownload }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF load error:', error);
    setError('Failed to load PDF. Please try again.');
    setLoading(false);
  }

  const changePage = (offset: number) => {
    setPageNumber(prev => Math.min(Math.max(prev + offset, 1), numPages || 1));
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 2));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-700">
        <div className="flex items-center gap-3">
          <h3 className="font-medium">{fileName || 'PDF Viewer'}</h3>
          {loading && <span className="text-sm text-slate-400">Loading...</span>}
          {numPages && <span className="text-sm text-slate-400">Page {pageNumber} of {numPages}</span>}
        </div>
        <div className="flex items-center gap-2">
          {onDownload && (
            <button onClick={onDownload} className="p-2 hover:bg-slate-700 rounded-lg transition">
              <Download className="w-5 h-5" />
            </button>
          )}
          <button onClick={zoomOut} className="p-2 hover:bg-slate-700 rounded-lg transition">
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm text-slate-400">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="p-2 hover:bg-slate-700 rounded-lg transition">
            <ZoomIn className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex-1 flex items-center justify-center text-white">
          <div className="text-center">
            <p className="text-red-400 mb-2">⚠️ {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!error && (
        <div className="flex-1 overflow-auto flex items-center justify-center p-4">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="text-white text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto mb-4" />
                <p>Loading PDF...</p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-xl"
            />
          </Document>
        </div>
      )}

      {numPages && numPages > 1 && (
        <div className="flex items-center justify-center gap-4 p-4 bg-slate-900 border-t border-slate-700">
          <button
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            className="p-2 hover:bg-slate-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-white">Page {pageNumber} of {numPages}</span>
          <button
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
            className="p-2 hover:bg-slate-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
