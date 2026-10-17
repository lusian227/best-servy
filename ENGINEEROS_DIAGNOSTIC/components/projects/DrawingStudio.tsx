// src/components/projects/DrawingStudio.tsx

import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface DrawingStudioProps {
  drawings: any[];
  onClose: () => void;
}

export function DrawingStudio({ drawings, onClose }: DrawingStudioProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  if (!drawings || drawings.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">No drawings to display</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition">
            Close
          </button>
        </div>
      </div>
    );
  }

  // ✅ FIX 1: Only ONE declaration
  const currentDrawing = drawings[currentIndex];

  // 🔍 DEBUG: Log the drawing object
  console.log("🔍 Selected drawing:", currentDrawing);
  console.log("🔍 Drawing ID:", currentDrawing?.id);
  console.log("🔍 Drawing title:", currentDrawing?.title);
  console.log("🔍 Drawing fileUrl:", currentDrawing?.fileUrl);
  console.log("🔍 Drawing metadata:", currentDrawing?.metadata);
  console.log("🔍 Drawing metadata.storageUrl:", currentDrawing?.metadata?.storageUrl);

  // Get the image URL - check multiple possible locations
  const getImageUrl = (drawing: any) => {
    if (!drawing) return null;

    // Check in order of preference
    if (drawing.fileUrl) return drawing.fileUrl;
    if (drawing.metadata?.storageUrl) return drawing.metadata.storageUrl;
    if (drawing.url) return drawing.url;
    if (drawing.previewUrl) return drawing.previewUrl;

    return null;
  };

  const imageUrl = getImageUrl(currentDrawing);

  // 🔍 DEBUG: Log the image URL
  console.log("🔍 Image URL:", imageUrl);
  console.log("🔍 Is blob URL:", imageUrl?.startsWith('blob:') || false);
  console.log("🔍 Current drawing full object:", currentDrawing);

  // Check if the URL is a blob URL
  const isBlobUrl = imageUrl?.startsWith('blob:') || false;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : drawings.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < drawings.length - 1 ? prev + 1 : 0));
  };

  const handleDownload = () => {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900/50 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition">
            <X className="w-5 h-5 text-white" />
          </button>
          <div>
            <h3 className="text-white font-medium">{currentDrawing?.title || 'Drawing'}</h3>
            <p className="text-xs text-slate-400">
              {currentIndex + 1} of {drawings.length} • {currentDrawing?.drawingNumber || ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.min(zoom + 0.25, 3))}
            className="p-2 hover:bg-slate-700 rounded-lg transition text-white"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => setZoom(Math.max(zoom - 0.25, 0.5))}
            className="p-2 hover:bg-slate-700 rounded-lg transition text-white"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-slate-700 rounded-lg transition text-white"
          >
            <Download className="w-5 h-5" />
          </button>
          <span className="text-xs text-slate-400 ml-2">{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Navigation Buttons */}
        {drawings.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition text-white"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image Display */}
        <div className="flex items-center justify-center max-w-full max-h-full">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={currentDrawing?.title || 'Drawing'}
              className="max-w-full max-h-[80vh] object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom})`,
              }}
              onError={(e) => {
                console.error('❌ Image failed to load:', imageUrl);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="text-center text-slate-400">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-lg">No preview available</p>
              <p className="text-sm mt-2">This file type cannot be previewed.</p>
              <button
                onClick={handleDownload}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Download File
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ FIX 2: Thumbnails - show blob URLs too */}
      {drawings.length > 1 && (
        <div className="p-4 bg-slate-900/50 backdrop-blur-sm border-t border-slate-700">
          <div className="flex gap-2 overflow-x-auto justify-center">
            {drawings.map((drawing, index) => {
              const thumbUrl = getImageUrl(drawing);
              return (
                <button
                  key={drawing.id || index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition flex items-center justify-center text-xs text-slate-400 ${index === currentIndex
                      ? "border-emerald-500"
                      : "border-slate-700 hover:border-slate-500"
                    }`}
                >
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={drawing.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-2xl">📄</span>
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