// src/components/projects/DrawingStudio.tsx

import React, { useMemo, useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Upload,
  Eye,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Maximize2,
} from 'lucide-react';

import { SingleSourceLink } from '../../types';

interface DrawingStudioProps {
  drawings?: any[];
  onClose?: () => void;
  onBack?: () => void;
  onUploadDrawing?: () => void;

  onOpenTrace?: (
    root: {
      id: string;
      type: string;
      title: string;
      subtitle?: string;
    },
    links: SingleSourceLink[]
  ) => void;
}

type ViewerType =
  | 'image'
  | 'pdf'
  | 'office'
  | 'cad'
  | 'unknown';

interface FileInfo {
  url: string | null;
  mimeType: string;
  extension: string;
  viewerType: ViewerType;
  label: string;
}

export function DrawingStudio({
  drawings = [],
  onClose,
  onBack,
  onUploadDrawing,
  onOpenTrace,
}: DrawingStudioProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [loadingViewer, setLoadingViewer] = useState(false);

  // ============================================================
  // CURRENT DRAWING
  // ============================================================

  const currentDrawing = drawings[currentIndex];

  // ============================================================
  // FILE URL
  // ============================================================

  const getFileUrl = (drawing: any): string | null => {
    if (!drawing) return null;

    return (
      drawing.fileUrl ||
      drawing.storageUrl ||
      drawing.url ||
      drawing.previewUrl ||
      drawing.metadata?.storageUrl ||
      null
    );
  };

  // ============================================================
  // FILE EXTENSION
  // ============================================================

  const getExtension = (drawing: any): string => {
    if (!drawing) return '';

    const fileName =
      drawing.fileName ||
      drawing.fileNameOriginal ||
      drawing.title ||
      '';

    const parts = fileName.split('.');

    if (parts.length < 2) {
      return '';
    }

    return parts.pop()?.toLowerCase() || '';
  };

  // ============================================================
  // MIME TYPE
  // ============================================================

  const getMimeType = (drawing: any): string => {
    if (!drawing) return '';

    return (
      drawing.mimeType ||
      drawing.fileType ||
      drawing.metadata?.mimeType ||
      ''
    ).toLowerCase();
  };

  // ============================================================
  // FILE TYPE DETECTION
  // ============================================================

  const getFileInfo = (drawing: any): FileInfo => {
    const url = getFileUrl(drawing);

    const extension = getExtension(drawing);

    let mimeType = getMimeType(drawing);

    // ----------------------------------------------------------
    // MIME TYPE FALLBACK
    // ----------------------------------------------------------

    if (!mimeType) {
      const mimeMap: Record<string, string> = {
        pdf: 'application/pdf',

        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        bmp: 'image/bmp',

        doc: 'application/msword',
        docx:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

        xls: 'application/vnd.ms-excel',
        xlsx:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

        ppt: 'application/vnd.ms-powerpoint',
        pptx:
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',

        dwg: 'application/acad',
        dxf: 'application/dxf',
      };

      mimeType = mimeMap[extension] || '';
    }

    // ----------------------------------------------------------
    // IMAGE
    // ----------------------------------------------------------

    if (
      mimeType.startsWith('image/') ||
      ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(extension)
    ) {
      return {
        url,
        mimeType,
        extension,
        viewerType: 'image',
        label: 'Image',
      };
    }

    // ----------------------------------------------------------
    // PDF
    // ----------------------------------------------------------

    if (
      mimeType === 'application/pdf' ||
      extension === 'pdf'
    ) {
      return {
        url,
        mimeType: 'application/pdf',
        extension,
        viewerType: 'pdf',
        label: 'PDF',
      };
    }

    // ----------------------------------------------------------
    // MICROSOFT OFFICE
    // ----------------------------------------------------------

    const officeExtensions = [
      'doc',
      'docx',
      'xls',
      'xlsx',
      'ppt',
      'pptx',
    ];

    const isOfficeMime =
      mimeType.includes('word') ||
      mimeType.includes('excel') ||
      mimeType.includes('spreadsheet') ||
      mimeType.includes('powerpoint') ||
      mimeType.includes('presentation');

    if (officeExtensions.includes(extension) || isOfficeMime) {
      return {
        url,
        mimeType,
        extension,
        viewerType: 'office',
        label: getOfficeLabel(extension),
      };
    }

    // ----------------------------------------------------------
    // CAD
    // ----------------------------------------------------------

    if (['dwg', 'dxf'].includes(extension)) {
      return {
        url,
        mimeType,
        extension,
        viewerType: 'cad',
        label: 'CAD',
      };
    }

    // ----------------------------------------------------------
    // UNKNOWN
    // ----------------------------------------------------------

    return {
      url,
      mimeType,
      extension,
      viewerType: 'unknown',
      label: extension
        ? extension.toUpperCase()
        : 'File',
    };
  };

  // ============================================================
  // OFFICE LABEL
  // ============================================================

  function getOfficeLabel(extension: string): string {
    if (['xls', 'xlsx'].includes(extension)) {
      return 'Excel';
    }

    if (['doc', 'docx'].includes(extension)) {
      return 'Word';
    }

    if (['ppt', 'pptx'].includes(extension)) {
      return 'PowerPoint';
    }

    return 'Office';
  }

  // ============================================================
  // CURRENT FILE INFO
  // ============================================================

  const fileInfo = useMemo(
    () => getFileInfo(currentDrawing),
    [currentDrawing]
  );

  // ============================================================
  // OFFICE VIEWER URL
  // ============================================================

  const officeViewerUrl = useMemo(() => {
    if (
      fileInfo.viewerType !== 'office' ||
      !fileInfo.url
    ) {
      return null;
    }

    return (
      'https://view.officeapps.live.com/op/view.aspx?src=' +
      encodeURIComponent(fileInfo.url)
    );
  }, [fileInfo]);

  // ============================================================
  // RESET VIEWER
  // ============================================================

  const resetViewerState = () => {
    setViewerError(null);
    setLoadingViewer(false);
    setZoom(1);
  };

  // ============================================================
  // NAVIGATION
  // ============================================================

  const handlePrevious = () => {
    resetViewerState();

    setCurrentIndex((previous) =>
      previous > 0
        ? previous - 1
        : drawings.length - 1
    );
  };

  const handleNext = () => {
    resetViewerState();

    setCurrentIndex((previous) =>
      previous < drawings.length - 1
        ? previous + 1
        : 0
    );
  };

  // ============================================================
  // DOWNLOAD
  // ============================================================

  const handleDownload = () => {
    if (!fileInfo.url) {
      return;
    }

    window.open(fileInfo.url, '_blank', 'noopener,noreferrer');
  };

  // ============================================================
  // OPEN ORIGINAL FILE ✅ FIXED — accepts optional drawing parameter
  // ============================================================

  const handleOpenOriginal = (drawing?: any) => {
    // If a drawing is passed, use its URL; otherwise use the current fileInfo.url
    const url = drawing ? getFileUrl(drawing) : fileInfo.url;

    if (!url) {
      return;
    }

    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );
  };

  // ============================================================
  // TRACE
  // ============================================================

  const handleTrace = (drawing: any) => {
    if (!onOpenTrace) {
      return;
    }

    onOpenTrace(
      {
        id: drawing.id,
        type: 'drawing',
        title: drawing.title || 'Drawing',
        subtitle:
          drawing.drawingNumber ||
          drawing.revision ||
          undefined,
      },
      []
    );
  };

  // ============================================================
  // VIEWER ICON
  // ============================================================

  const getFileIcon = (type: ViewerType) => {
    switch (type) {
      case 'image':
        return FileImage;

      case 'pdf':
        return FileText;

      case 'office':
        return FileSpreadsheet;

      case 'cad':
        return FileText;

      default:
        return File;
    }
  };

  // ============================================================
  // THUMBNAIL
  // ============================================================

  const renderThumbnail = (drawing: any) => {
    const info = getFileInfo(drawing);
    const Icon = getFileIcon(info.viewerType);

    if (
      info.viewerType === 'image' &&
      info.url
    ) {
      return (
        <img
          src={info.url}
          alt={drawing.title || 'Drawing'}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      );
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800">
        <Icon className="w-10 h-10 text-slate-400" />

        <span className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          {info.label}
        </span>
      </div>
    );
  };

  // ============================================================
  // IMAGE VIEWER
  // ============================================================

  const renderImageViewer = () => {
    if (!fileInfo.url) {
      return renderViewerError('Image URL is unavailable.');
    }

    return (
      <div className="flex items-center justify-center max-w-full max-h-full overflow-auto">
        <img
          src={fileInfo.url}
          alt={currentDrawing?.title || 'Drawing'}
          className="max-w-none object-contain transition-transform duration-200"
          style={{
            maxHeight: '80vh',
            transform: `scale(${zoom})`,
          }}
          onLoad={() => {
            setLoadingViewer(false);
            setViewerError(null);
          }}
          onError={() => {
            setLoadingViewer(false);
            setViewerError(
              'The image could not be loaded. The storage URL may be invalid or expired.'
            );
          }}
        />
      </div>
    );
  };

  // ============================================================
  // PDF VIEWER
  // ============================================================

  const renderPDFViewer = () => {
    if (!fileInfo.url) {
      return renderViewerError('PDF URL is unavailable.');
    }

    return (
      <div className="w-full h-[82vh] bg-slate-800 rounded-xl overflow-hidden">
        <iframe
          key={fileInfo.url}
          src={fileInfo.url}
          title={currentDrawing?.title || 'PDF Drawing'}
          className="w-full h-full border-0"
          onLoad={() => {
            setLoadingViewer(false);
            setViewerError(null);
          }}
        />
      </div>
    );
  };

  // ============================================================
  // OFFICE VIEWER
  // ============================================================

  const renderOfficeViewer = () => {
    if (!officeViewerUrl) {
      return renderViewerError(
        'Office document URL is unavailable.'
      );
    }

    return (
      <div className="w-full h-[82vh] bg-white rounded-xl overflow-hidden">
        <iframe
          key={officeViewerUrl}
          src={officeViewerUrl}
          title={
            currentDrawing?.title ||
            `${fileInfo.label} document`
          }
          className="w-full h-full border-0"
          onLoad={() => {
            setLoadingViewer(false);
            setViewerError(null);
          }}
        />
      </div>
    );
  };

  // ============================================================
  // CAD VIEWER
  // ============================================================

  const renderCADViewer = () => {
    return (
      <div className="flex flex-col items-center justify-center text-center max-w-lg">
        <div className="w-20 h-20 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <FileText className="w-10 h-10 text-amber-600 dark:text-amber-400" />
        </div>

        <h3 className="mt-5 text-xl font-semibold text-white">
          {fileInfo.extension.toUpperCase()} Drawing
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          EngineerOS does not natively render this CAD format
          in the browser yet.
        </p>

        <div className="flex gap-2 mt-5">
          <button
            onClick={handleOpenOriginal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open File
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    );
  };

  // ============================================================
  // UNKNOWN FILE
  // ============================================================

  const renderUnknownViewer = () => {
    const Icon = getFileIcon(fileInfo.viewerType);

    return (
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center">
          <Icon className="w-10 h-10 text-slate-400" />
        </div>

        <h3 className="mt-5 text-xl font-semibold text-white">
          Preview unavailable
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          This file type cannot currently be previewed
          inside EngineerOS.
        </p>

        <button
          onClick={handleDownload}
          className="mt-5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download File
        </button>
      </div>
    );
  };

  // ============================================================
  // VIEWER ERROR
  // ============================================================

  const renderViewerError = (message: string) => {
    return (
      <div className="flex flex-col items-center justify-center text-center max-w-lg">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>

        <h3 className="mt-4 text-lg font-semibold text-white">
          Unable to display file
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          {message}
        </p>

        <div className="flex gap-2 mt-5">
          <button
            onClick={() => {
              setViewerError(null);
              setLoadingViewer(true);
            }}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    );
  };

  // ============================================================
  // MAIN VIEWER
  // ============================================================

  const renderViewer = () => {
    if (viewerError) {
      return renderViewerError(viewerError);
    }

    switch (fileInfo.viewerType) {
      case 'image':
        return renderImageViewer();

      case 'pdf':
        return renderPDFViewer();

      case 'office':
        return renderOfficeViewer();

      case 'cad':
        return renderCADViewer();

      default:
        return renderUnknownViewer();
    }
  };

  // ============================================================
  // EMPTY STATE
  // ============================================================

  if (!drawings || drawings.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>

        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
          No Drawings
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          This project doesn't have any drawings yet.
        </p>

        {onUploadDrawing && (
          <button
            onClick={onUploadDrawing}
            className="mt-5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 mx-auto"
          >
            <Upload className="w-4 h-4" />
            Upload First Drawing
          </button>
        )}

        {onBack && (
          <button
            onClick={onBack}
            className="mt-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm transition"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  // ============================================================
  // MODAL MODE
  // ============================================================

  if (onClose) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">

        {/* HEADER */}
        <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-700">

          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <h3 className="text-white font-medium truncate">
                {currentDrawing?.title || 'Drawing'}
              </h3>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>
                  {currentIndex + 1} of {drawings.length}
                </span>

                {currentDrawing?.drawingNumber && (
                  <>
                    <span>•</span>
                    <span>
                      {currentDrawing.drawingNumber}
                    </span>
                  </>
                )}

                {fileInfo.label && (
                  <>
                    <span>•</span>
                    <span>
                      {fileInfo.label}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* HEADER ACTIONS */}
          <div className="flex items-center gap-1">

            {fileInfo.viewerType === 'image' && (
              <>
                <button
                  onClick={() =>
                    setZoom(
                      Math.min(zoom + 0.25, 4)
                    )
                  }
                  className="p-2 hover:bg-slate-800 rounded-lg text-white transition"
                  title="Zoom in"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>

                <button
                  onClick={() =>
                    setZoom(
                      Math.max(zoom - 0.25, 0.5)
                    )
                  }
                  className="p-2 hover:bg-slate-800 rounded-lg text-white transition"
                  title="Zoom out"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>

                <span className="text-xs text-slate-400 px-2">
                  {Math.round(zoom * 100)}%
                </span>
              </>
            )}

            <button
              onClick={handleOpenOriginal}
              className="p-2 hover:bg-slate-800 rounded-lg text-white transition"
              title="Open original"
            >
              <ExternalLink className="w-5 h-5" />
            </button>

            <button
              onClick={handleDownload}
              className="p-2 hover:bg-slate-800 rounded-lg text-white transition"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">

          {/* PREVIOUS */}
          {drawings.length > 1 && (
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/60 hover:bg-black/80 rounded-full text-white transition"
              title="Previous drawing"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* VIEWER */}
          <div className="w-full h-full flex items-center justify-center">
            {renderViewer()}
          </div>

          {/* NEXT */}
          {drawings.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/60 hover:bg-black/80 rounded-full text-white transition"
              title="Next drawing"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* THUMBNAILS */}
        {drawings.length > 1 && (
          <div className="p-4 bg-slate-900 border-t border-slate-700">
            <div className="flex gap-2 overflow-x-auto justify-center">

              {drawings.map((drawing, index) => {
                const info = getFileInfo(drawing);

                return (
                  <button
                    key={drawing.id || index}
                    onClick={() => {
                      resetViewerState();
                      setCurrentIndex(index);
                    }}
                    className={`
                      relative w-16 h-16 flex-shrink-0
                      rounded-lg overflow-hidden
                      border-2 transition
                      ${index === currentIndex
                        ? 'border-emerald-500'
                        : 'border-slate-700 hover:border-slate-500'
                      }
                    `}
                    title={drawing.title}
                  >
                    {info.viewerType === 'image' &&
                      info.url ? (
                      <img
                        src={info.url}
                        alt={drawing.title || 'Drawing'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center">
                        {React.createElement(
                          getFileIcon(info.viewerType),
                          {
                            className:
                              'w-6 h-6 text-slate-400',
                          }
                        )}

                        <span className="text-[9px] text-slate-500 mt-1">
                          {info.label}
                        </span>
                      </div>
                    )}

                    {index === currentIndex && (
                      <div className="absolute inset-0 ring-2 ring-inset ring-emerald-500 pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // INLINE MODE
  // ============================================================

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">

          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Drawing Studio
            </h3>

            <span className="text-sm text-slate-500 dark:text-slate-400">
              {drawings.length} drawing
              {drawings.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {onUploadDrawing && (
          <button
            onClick={onUploadDrawing}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
        )}
      </div>

      {/* DRAWING GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

        {drawings.map((drawing, index) => {
          const info = getFileInfo(drawing);

          return (
            <div
              key={drawing.id || index}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition"
            >

              {/* PREVIEW */}
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {renderThumbnail(drawing)}
              </div>

              {/* INFORMATION */}
              <div className="p-3">

                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {drawing.title || 'Untitled Drawing'}
                </p>

                {drawing.drawingNumber && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {drawing.drawingNumber}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    {info.label}
                  </span>

                  {drawing.revision && (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/20 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      {drawing.revision}
                    </span>
                  )}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="px-3 pb-3 flex gap-2">

                <button
                  onClick={() => {
                    setCurrentIndex(index);
                    resetViewerState();

                    if (onClose) {
                      return;
                    }

                    handleOpenOriginal(drawing);
                  }}
                  className="flex-1 px-2 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition flex items-center justify-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  Open
                </button>

                {onOpenTrace && (
                  <button
                    onClick={() =>
                      handleTrace(drawing)
                    }
                    className="px-2 py-1.5 text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition"
                  >
                    Trace
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}