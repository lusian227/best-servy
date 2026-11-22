
import React, { useEffect, useState } from 'react';
import {
  X,
  Download,
  FileText,
  Image,
  FileCode,
  Film,
  Music,
  File,
  Globe,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import DOMPurify from 'dompurify';

export interface ViewerProps {
  fileUrl: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  onClose?: () => void;
  onDownload?: () => void;
}

type OfficePreview =
  | { kind: 'docx'; html: string }
  | { kind: 'spreadsheet'; rows: unknown[][]; sheetName: string }
  | { kind: 'text'; text: string }
  | { kind: 'shortcut'; url: string }
  | null;

export function ViewerFactory({
  fileUrl,
  fileName,
  mimeType,
  fileSize,
  onClose,
  onDownload,
}: ViewerProps) {
  const ext = fileName?.split('.').pop()?.toLowerCase() || '';

  // File type detection
  const isImage =
    mimeType?.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);

  const isPDF = mimeType === 'application/pdf' || ext === 'pdf';

  const isVideo =
    mimeType?.startsWith('video/') ||
    ['mp4', 'webm', 'mov', 'avi'].includes(ext);

  const isAudio =
    mimeType?.startsWith('audio/') ||
    ['mp3', 'wav', 'ogg'].includes(ext);

  const isDOCX = ext === 'docx';

  const isURLShortcut = ext === 'url';

  const isSpreadsheet = ['xlsx', 'xls', 'csv'].includes(ext);

  const isText = [
    'txt',
    'html',
    'htm',
    'css',
    'js',
    'json',
    'xml',
    'md',
  ].includes(ext);

  const isCAD = ['dwg', 'dxf'].includes(ext);

  const isIFC = ['ifc', 'ifcxml', 'ifczip'].includes(ext);

  // Preview state
  const [officePreview, setOfficePreview] =
    useState<OfficePreview>(null);

  const [loading, setLoading] = useState(false);

  const [previewError, setPreviewError] = useState('');

  // Load document previews
  useEffect(() => {
    let cancelled = false;

    const loadPreview = async () => {
      if (
        !isDOCX &&
        !isSpreadsheet &&
        !isText &&
        !isURLShortcut
      ) {
        setOfficePreview(null);
        setPreviewError('');
        setLoading(false);
        return;
      }

      if (!fileUrl) {
        setOfficePreview(null);
        setPreviewError('The file URL is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setPreviewError('');
      setOfficePreview(null);

      try {
        const response = await fetch(fileUrl);

        if (!response.ok) {
          throw new Error(
            `Unable to retrieve file. Server returned ${response.status}.`
          );
        }

        // Microsoft Word document
        if (isDOCX) {
          const arrayBuffer = await response.arrayBuffer();

          const result = await mammoth.convertToHtml({
            arrayBuffer,
          });

          const safeHtml = DOMPurify.sanitize(result.value);

          if (!cancelled) {
            setOfficePreview({
              kind: 'docx',
              html: safeHtml,
            });
          }
        }

        // Excel and CSV documents
        else if (isSpreadsheet) {
          const arrayBuffer = await response.arrayBuffer();

          const workbook = XLSX.read(arrayBuffer, {
            type: 'array',
          });

          const sheetName = workbook.SheetNames[0];

          if (!sheetName) {
            throw new Error(
              'This spreadsheet contains no worksheets.'
            );
          }

          const worksheet = workbook.Sheets[sheetName];

          const rows = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
            blankrows: false,
          }) as unknown[][];

          if (!cancelled) {
            setOfficePreview({
              kind: 'spreadsheet',
              rows,
              sheetName,
            });
          }
        }

        // Plain text documents
        else if (isText) {
          const text = await response.text();

          if (!cancelled) {
            setOfficePreview({
              kind: 'text',
              text,
            });
          }
        }

        // Windows Internet Shortcut (.url)
        else if (isURLShortcut) {
          const shortcutContent = await response.text();

          const match = shortcutContent.match(
            /^\s*URL\s*=\s*(.+?)\s*$/im
          );

          const destination = match?.[1]?.trim();

          if (!destination) {
            throw new Error(
              'This Internet Shortcut does not contain a destination address.'
            );
          }

          let parsedUrl: URL;

          try {
            parsedUrl = new URL(destination);
          } catch {
            throw new Error(
              'The shortcut contains an invalid web address.'
            );
          }

          if (
            parsedUrl.protocol !== 'http:' &&
            parsedUrl.protocol !== 'https:'
          ) {
            throw new Error(
              'Only HTTP and HTTPS shortcut addresses are supported.'
            );
          }

          if (!cancelled) {
            setOfficePreview({
              kind: 'shortcut',
              url: parsedUrl.href,
            });
          }
        }
      } catch (error) {
        if (!cancelled) {
          setPreviewError(
            error instanceof Error
              ? error.message
              : 'Could not preview this file.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [
    fileUrl,
    isDOCX,
    isSpreadsheet,
    isText,
    isURLShortcut,
  ]);

  // File icons
  const getIcon = () => {
    if (isImage) return <Image className="w-16 h-16" />;

    if (isPDF) return <FileText className="w-16 h-16" />;

    if (isVideo) return <Film className="w-16 h-16" />;

    if (isAudio) return <Music className="w-16 h-16" />;

    if (isURLShortcut) return <Globe className="w-16 h-16" />;

    if (isDOCX || isSpreadsheet || isCAD || isIFC) {
      return <FileCode className="w-16 h-16" />;
    }

    return <File className="w-16 h-16" />;
  };

  // Office, text and shortcut previews
  const renderOfficePreview = () => {
    if (loading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 text-white">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p>Preparing document preview...</p>
        </div>
      );
    }

    if (previewError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 text-white p-8">
          <AlertCircle className="w-12 h-12 text-amber-400 mb-4" />

          <h3 className="text-lg font-semibold mb-2">
            Preview could not be loaded
          </h3>

          <p className="text-slate-400 text-center max-w-xl">
            {previewError}
          </p>

          <p className="text-slate-500 text-sm mt-3">
            You can still download the original file.
          </p>

          {onDownload && (
            <button
              onClick={onDownload}
              className="mt-5 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download File
            </button>
          )}
        </div>
      );
    }

    if (!officePreview) {
      return (
        <div className="flex-1 flex items-center justify-center bg-slate-900 text-slate-400">
          No preview available.
        </div>
      );
    }

    // Internet Shortcut preview
    if (officePreview.kind === 'shortcut') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 text-white p-6 md:p-10">
          <div className="w-24 h-24 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
            <Globe className="w-14 h-14 text-blue-400" />
          </div>

          <h2 className="text-2xl font-semibold mb-2 text-center">
            Internet Shortcut
          </h2>

          <p className="text-slate-400 text-center mb-8">
            This file contains a saved web address.
          </p>

          <div className="w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-xl p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">
              Destination address
            </p>

            <a
              href={officePreview.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline break-all"
            >
              {officePreview.url}
            </a>
          </div>

          <a
            href={officePreview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 px-7 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            Open Link
          </a>

          <p className="text-slate-500 text-xs text-center mt-5 max-w-lg">
            The shortcut opens its saved destination in a new browser tab.
            It does not contain the actual notebook pages or documents.
          </p>
        </div>
      );
    }

    // Word document preview
    if (officePreview.kind === 'docx') {
      return (
        <div className="flex-1 overflow-auto bg-slate-200 p-4 md:p-8">
          <article
            className="mx-auto max-w-4xl min-h-full bg-white text-slate-900 p-6 md:p-12 shadow-xl rounded-sm prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{
              __html: officePreview.html,
            }}
          />
        </div>
      );
    }

    // Excel and CSV preview
    if (officePreview.kind === 'spreadsheet') {
      return (
        <div className="flex-1 overflow-auto bg-slate-100 p-4">
          <div className="bg-white rounded-lg shadow overflow-auto">
            <div className="px-4 py-3 border-b bg-slate-50 text-slate-700 font-semibold">
              Worksheet: {officePreview.sheetName}
            </div>

            <table className="min-w-full border-collapse text-sm text-slate-800">
              <tbody>
                {officePreview.rows.slice(0, 500).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.slice(0, 30).map((cell, cellIndex) => {
                      const Cell = rowIndex === 0 ? 'th' : 'td';

                      return (
                        <Cell
                          key={cellIndex}
                          className="border border-slate-300 px-3 py-2 text-left whitespace-nowrap"
                        >
                          {String(cell ?? '')}
                        </Cell>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {officePreview.rows.length > 500 && (
              <p className="p-3 text-sm text-slate-500">
                Preview limited to the first 500 rows. Download the file to
                view the complete spreadsheet.
              </p>
            )}
          </div>
        </div>
      );
    }

    // Plain text preview
    return (
      <div className="flex-1 overflow-auto bg-slate-900 p-4 md:p-8">
        <pre className="mx-auto max-w-5xl whitespace-pre-wrap break-words text-sm text-slate-100 bg-slate-800 p-6 rounded-lg">
          {officePreview.text}
        </pre>
      </div>
    );
  };

  // Main file preview
  const getPreview = () => {
    if (isImage) {
      return (
        <div className="flex-1 flex items-center justify-center p-4 bg-slate-900">
          <img
            src={fileUrl}
            alt={fileName || 'Document image'}
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
            className="w-full h-full min-h-[500px] rounded-lg bg-white"
            title={fileName || 'PDF document'}
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

    if (isDOCX || isSpreadsheet || isText || isURLShortcut) {
      return renderOfficePreview();
    }

    // Unsupported formats
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900 text-white">
        {getIcon()}

        <h3 className="text-xl font-medium mt-4 text-center">
          {fileName || 'Unknown file'}
        </h3>

        <p className="text-slate-400 text-sm mt-2">
          {mimeType || 'Unknown file type'}
        </p>

        {fileSize && (
          <p className="text-slate-400 text-sm">
            {(fileSize / 1024 / 1024).toFixed(2)} MB
          </p>
        )}

        <p className="text-slate-500 text-sm mt-4 text-center">
          {isCAD || isIFC
            ? 'This engineering file requires a specialised CAD or BIM viewer.'
            : 'Preview is not available for this file type.'}
        </p>

        {onDownload && (
          <button
            onClick={onDownload}
            className="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download File
          </button>
        )}
      </div>
    );
  };

  // Viewer layout
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-700">
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="font-medium truncate max-w-md">
            {fileName || 'File Viewer'}
          </h3>

          <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded shrink-0">
            {mimeType || ext || 'unknown'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onDownload && (
            <button
              onClick={onDownload}
              className="p-2 hover:bg-slate-700 rounded-lg transition"
              title="Download"
              aria-label="Download file"
            >
              <Download className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
            title="Close"
            aria-label="Close viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Preview content */}
      {getPreview()}
    </div>
  );
}
