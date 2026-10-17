// src/modules/records/components/viewers/ImageViewer.tsx

import React, { useState } from 'react';
import { Download, ZoomIn, ZoomOut, X } from 'lucide-react';

interface ImageViewerProps {
    fileUrl: string;
    fileName?: string;
    onClose?: () => void;
    onDownload?: () => void;
}

// ✅ Helper to fix image URLs - Using YOUR actual Supabase URL
const getFullImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) {
        // Your actual Supabase URL from .env
        const SUPABASE_URL = 'https://ajlnexboxgqimfeftlbk.supabase.co';
        return `${SUPABASE_URL}/storage/v1/object/public/uploads${url}`;
    }
    return url;
};

export function ImageViewer({ fileUrl, fileName, onClose, onDownload }: ImageViewerProps) {
    const [scale, setScale] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
    const resetZoom = () => setScale(1);

    const handleImageLoad = () => setLoading(false);
    const handleImageError = () => {
        setError('Failed to load image. Please try again.');
        setLoading(false);
        console.error('❌ IMAGE FAILED TO LOAD:', fileUrl);
    };

    const fullUrl = getFullImageUrl(fileUrl);

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <h3 className="font-medium">{fileName || 'Image Viewer'}</h3>
                    {loading && <span className="text-sm text-slate-400">Loading...</span>}
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
                    <button onClick={resetZoom} className="px-2 py-1 text-xs bg-slate-700 rounded hover:bg-slate-600 transition">
                        {Math.round(scale * 100)}%
                    </button>
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
                        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {!error && (
                <div className="flex-1 overflow-auto flex items-center justify-center p-4">
                    <div className="relative">
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
                            </div>
                        )}
                        <img
                            src={fullUrl}
                            alt={fileName || 'Image'}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            style={{
                                transform: `scale(${scale})`,
                                transition: 'transform 0.2s ease',
                                maxWidth: '100%',
                                maxHeight: '100%',
                            }}
                            className="shadow-xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}