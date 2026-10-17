import React, { useState, useEffect } from 'react';
import { X, Download, File } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DocumentViewerProps {
    record: any;
    onClose: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ record, onClose }) => {
    const [content, setContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDocument();
    }, [record]);

    // ✅ Get storage path from metadata first, then fallback to URL extraction
    const getStoragePath = (record: any): string => {
        // 1. Best source: explicitly stored storage path
        if (record.metadata?.storagePath) {
            console.log('📂 Using metadata.storagePath:', record.metadata.storagePath);
            return record.metadata.storagePath;
        }

        // 2. Try to extract from a Supabase public URL
        const url = record.storageUrl;

        if (url) {
            console.log('📂 Extracting path from storage URL:', url);

            const marker = '/object/public/records/';

            if (url.includes(marker)) {
                const path = url.split(marker)[1];
                console.log('📂 Extracted public storage path:', path);
                return decodeURIComponent(path);
            }

            // Also support non-public object URLs
            const privateMarker = '/object/records/';

            if (url.includes(privateMarker)) {
                const path = url.split(privateMarker)[1];
                console.log('📂 Extracted private storage path:', path);
                return decodeURIComponent(path);
            }
        }

        console.warn('⚠️ Could not determine Supabase storage path for record:', record.id);
        return '';
    };

    // ✅ COMPLETE loadDocument function
    const loadDocument = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('========================================');
            console.log('📂 DOCUMENT VIEWER');
            console.log('Record:', record);
            console.log('Storage URL:', record.storageUrl);
            console.log('Metadata:', record.metadata);

            const storagePath = getStoragePath(record);

            console.log('📂 FINAL STORAGE PATH:', storagePath);

            if (!storagePath) {
                throw new Error(
                    'No Supabase storage path found for this document'
                );
            }

            // Download the file using the exact path
            const {
                data,
                error: downloadError,
            } = await supabase.storage
                .from('records')
                .download(storagePath);

            if (downloadError) {
                console.error(
                    '❌ Supabase download error:',
                    downloadError
                );

                throw downloadError;
            }

            if (!data) {
                throw new Error(
                    'Supabase returned no file data'
                );
            }

            console.log(
                '✅ File downloaded successfully:',
                data
            );

            const mimeType =
                record.mimeType ||
                record.metadata?.mimeType ||
                data.type ||
                '';

            console.log(
                '📄 MIME TYPE:',
                mimeType
            );

            // IMAGE
            if (mimeType.startsWith('image/')) {
                const url = URL.createObjectURL(data);

                setContent(url);
                return;
            }

            // PDF
            if (mimeType === 'application/pdf') {
                const url = URL.createObjectURL(data);

                setContent(url);
                return;
            }

            // TEXT
            if (mimeType.startsWith('text/')) {
                const text = await data.text();

                setContent(text);
                return;
            }

            // DOCX
            if (
                mimeType.includes(
                    'wordprocessingml'
                ) ||
                mimeType.includes('docx')
            ) {
                setContent('docx-preview');
                return;
            }

            // XLSX
            if (
                mimeType.includes(
                    'spreadsheetml'
                ) ||
                mimeType.includes('xlsx')
            ) {
                setContent('excel-preview');
                return;
            }

            setContent('unsupported');

        } catch (err: any) {
            console.error(
                '❌ Failed to load document:',
                err
            );

            setError(
                err?.message ||
                'Failed to load document'
            );

        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-12">
                    <File className="w-16 h-16 mx-auto text-red-400 mb-4" />
                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                    <button
                        onClick={loadDocument}
                        className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                    >
                        Retry
                    </button>
                </div>
            );
        }

        // Unsupported file types
        if (content === 'unsupported' || content === 'docx-preview' || content === 'excel-preview') {
            const fileType = content === 'docx-preview' ? 'DOCX' :
                content === 'excel-preview' ? 'Excel' : 'File';

            return (
                <div className="text-center py-12">
                    <File className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                        Preview not available for {fileType} files
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                        Download the file to view it locally
                    </p>
                    <button
                        onClick={() => window.open(record.storageUrl, '_blank')}
                        className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 mx-auto"
                    >
                        <Download className="w-4 h-4" />
                        Download File
                    </button>
                </div>
            );
        }

        // Image viewer
        if (record.mimeType?.startsWith('image/')) {
            return (
                <img
                    src={content || ''}
                    alt={record.title}
                    className="max-h-[70vh] mx-auto object-contain"
                />
            );
        }

        // PDF viewer
        if (record.mimeType === 'application/pdf') {
            return (
                <iframe
                    src={content || ''}
                    className="w-full h-[70vh] border-0"
                    title={record.title}
                />
            );
        }

        // Text viewer
        if (record.mimeType?.startsWith('text/')) {
            return (
                <pre className="whitespace-pre-wrap font-mono text-sm p-4 bg-slate-50 dark:bg-slate-800 rounded-lg max-h-[70vh] overflow-auto">
                    {content}
                </pre>
            );
        }

        return null;
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {record.title || record.fileName || 'Document'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {record.recordNumber} • {record.category}
                            {record.mimeType && (
                                <> • {record.mimeType.split('/').pop()}</>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {renderContent()}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        {record.fileName && (
                            <span>File: {record.fileName}</span>
                        )}
                        {record.fileSize && (
                            <span className="ml-3">
                                Size: {(record.fileSize / 1024 / 1024).toFixed(1)} MB
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => window.open(record.storageUrl, '_blank')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocumentViewer;