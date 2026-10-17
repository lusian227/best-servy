// src/modules/records/viewers/ViewerFactory.tsx

import React from 'react';
import { X, Download, FileText, Image, FileCode, Film, Music, File } from 'lucide-react';

export interface ViewerProps {
  fileUrl: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  onClose?: () => void;
  onDownload?: () => void;
}

export function ViewerFactory({ fileUrl, fileName, mimeType, fileSize, onClose, onDownload }: ViewerProps) {
  const ext = fileName?.split('.').pop()?.toLowerCase() || '';
  
  const isImage = mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
  const isPDF = mimeType === 'application/pdf' || ext === 'pdf';
  const isVideo = mimeType?.startsWith('video/') || ['mp4', 'webm', 'mov', 'avi'].includes(ext);
  const isAudio = mimeType?.startsWith('audio/') || ['mp3', 'wav', 'ogg'].includes(ext);
  const isOffice = ['xlsx', 'xls', 'docx', 'doc', 'pptx', 'ppt', 'csv'].includes(ext);
  const isText = ['txt', 'html', 'htm', 'css', 'js', 'json', 'xml'].includes(ext);
  const isCAD = ['dwg', 'dxf'].includes(ext);
  const isIFC = ['ifc', 'ifcxml', 'ifczip'].includes(ext);

  const getIcon = () => {
    if (isImage) return <Image className="w-16 h-16" />;
    if (isPDF) return <FileText className="w-16 h-16" />;
    if (isVideo) return <Film className="w-16 h-16" />;
    if (isAudio) return <Music className="w-16 h-16" />;
    if (isOffice) return <FileCode className="w-16 h-16" />;
    if (isCAD || isIFC) return <FileCode className="w-16 h-16" />;
    return <File className="w-16 h-16" />;
  };

  const getPreview = () => {
    if (isImage) {
      return (
        <div className="flex-1 flex items-center justify-center p-4 bg-slate-900">
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-[80vh] object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      );
    }

    if (isPDF) {
      return (
        <div className="flex-1 flex items-center justify-center p-4 bg-slate-900">
          <iframe
            src={fileUrl}
            className="w-full h-full min-h-[500px] rounded-lg"
            title={fileName}
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="flex-1 flex items-center justify-center p-4 bg-slate-900">
          <video controls className="max-w-full max-h-[80vh]">
            <source src={fileUrl} type={mimeType} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (isAudio) {
      return (
        <div className="flex-1 flex items-center justify-center p-4 bg-slate-900">
          <audio controls className="w-full max-w-md">
            <source src={fileUrl} type={mimeType} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    // Fallback: Show metadata and download
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900 text-white">
        {getIcon()}
        <h3 className="text-xl font-medium mt-4">{fileName}</h3>
        <p className="text-slate-400 text-sm mt-2">
          {mimeType || 'Unknown file type'}
        </p>
        {fileSize && (
          <p className="text-slate-400 text-sm">
            {(fileSize / 1024 / 1024).toFixed(2)} MB
          </p>
        )}
        <p className="text-slate-500 text-sm mt-4">
          Preview not available
        </p>
        <button
          onClick={onDownload}
          className="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download File
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-700">
        <div className="flex items-center gap-3">
          <h3 className="font-medium truncate max-w-md">{fileName || 'File Viewer'}</h3>
          <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            {mimeType || ext || 'unknown'}
          </span>
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
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {getPreview()}
    </div>
  );
}
