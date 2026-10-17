// src/modules/records/components/viewers/ViewerFactory.tsx

import React from 'react';
import { PDFViewer } from './PDFViewer';
import { ImageViewer } from './ImageViewer';
import { OfficeViewer } from './OfficeViewer';
import { GoogleViewer } from './GoogleViewer';
import { HtmlViewer } from './HtmlViewer';
import { X, Download, FileText } from 'lucide-react';

export interface ViewerProps {
  fileUrl: string;
  fileName?: string;
  mimeType?: string;
  viewerType?: 'auto' | 'pdfjs' | 'office' | 'google' | 'html';
  onClose?: () => void;
  onDownload?: () => void;
}

export function ViewerFactory({ 
  fileUrl, 
  fileName, 
  mimeType, 
  viewerType = 'auto',
  onClose, 
  onDownload 
}: ViewerProps) {
  
  const detectViewerByExtension = (ext: string): string => {
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'tif'];
    const pdfExts = ['pdf'];
    const officeExts = ['xlsx', 'xls', 'docx', 'doc', 'pptx', 'ppt', 'csv'];
    const htmlExts = ['html', 'htm'];
    const cadExts = ['dwg', 'dxf'];
    const ifcExts = ['ifc', 'ifcxml', 'ifczip'];

    if (imageExts.includes(ext)) return 'image';
    if (pdfExts.includes(ext)) return 'pdf';
    if (officeExts.includes(ext)) return 'office';
    if (htmlExts.includes(ext)) return 'html';
    if (cadExts.includes(ext)) return 'cad';
    if (ifcExts.includes(ext)) return 'ifc';
    return 'fallback';
  };

  const getViewer = () => {
    // If user specifically chose a viewer type, use it
    if (viewerType === 'pdfjs') return 'pdf';
    if (viewerType === 'office') return 'office';
    if (viewerType === 'google') return 'google';
    if (viewerType === 'html') return 'html';

    // Auto-detect based on file type
    if (!mimeType) {
      const extension = fileName?.split('.').pop()?.toLowerCase();
      if (extension) {
        return detectViewerByExtension(extension);
      }
      return 'fallback';
    }

    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'text/html' || mimeType === 'text/htm') return 'html';
    
    if (
      mimeType.includes('sheet') || 
      mimeType.includes('excel') || 
      mimeType.includes('document') || 
      mimeType.includes('word') ||
      mimeType.includes('presentation') || 
      mimeType.includes('powerpoint') ||
      mimeType.includes('spreadsheet')
    ) {
      return 'office';
    }
    
    if (mimeType.includes('dwg') || mimeType.includes('dxf')) return 'cad';
    if (mimeType.includes('ifc')) return 'ifc';

    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext && detectViewerByExtension(ext)) {
      return detectViewerByExtension(ext);
    }

    return 'fallback';
  };

  const viewer = getViewer();

  switch (viewer) {
    case 'pdf':
      return <PDFViewer fileUrl={fileUrl} fileName={fileName} onClose={onClose} onDownload={onDownload} />;
    case 'image':
      return <ImageViewer fileUrl={fileUrl} fileName={fileName} onClose={onClose} onDownload={onDownload} />;
    case 'office':
      return <OfficeViewer fileUrl={fileUrl} fileName={fileName} onClose={onClose} onDownload={onDownload} />;
    case 'google':
      return <GoogleViewer fileUrl={fileUrl} fileName={fileName} onClose={onClose} onDownload={onDownload} />;
    case 'html':
      return <HtmlViewer fileUrl={fileUrl} fileName={fileName} onClose={onClose} onDownload={onDownload} />;
    case 'cad':
      return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-700">
            <h3 className="font-medium">CAD Viewer (Coming Soon)</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center text-white">
            <div className="text-center">
              <p className="text-6xl mb-4">📐</p>
              <p className="text-xl font-medium">CAD Viewer</p>
              <p className="text-slate-400 mt-2">DWG/DXF support coming soon!</p>
              <button onClick={onDownload} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
                Download File
              </button>
            </div>
          </div>
        </div>
      );
    case 'ifc':
      return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-700">
            <h3 className="font-medium">IFC Viewer (Coming Soon)</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center text-white">
            <div className="text-center">
              <p className="text-6xl mb-4">🏗️</p>
              <p className="text-xl font-medium">IFC Viewer</p>
              <p className="text-slate-400 mt-2">BIM/IFC support coming soon!</p>
              <button onClick={onDownload} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
                Download File
              </button>
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-700">
            <h3 className="font-medium">File Viewer</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center text-white">
            <div className="text-center max-w-md">
              <p className="text-6xl mb-4">📄</p>
              <p className="text-xl font-medium">{fileName || 'File'}</p>
              <p className="text-slate-400 mt-2">This file type ({mimeType || 'unknown'}) is not supported for preview.</p>
              <button onClick={onDownload} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
                Download File
              </button>
            </div>
          </div>
        </div>
      );
  }
}
