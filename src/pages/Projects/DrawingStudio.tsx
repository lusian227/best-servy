import React, { useState, useRef, useEffect } from 'react';
import { DrawingItem, SingleSourceLink } from '../../types';
import {
  Upload, FileImage, ArrowLeft, Layers, Link2, Eye, X,
  Circle, Square, Type, Highlighter, Eraser, Save, ZoomIn, ZoomOut
} from 'lucide-react';

interface DrawingStudioProps {
  drawings: DrawingItem[];
  onOpenTrace: (root: any, links?: SingleSourceLink[]) => void;
  onBack: () => void;
  onUploadDrawing: () => void;
}

type AnnotationTool = 'none' | 'circle' | 'rectangle' | 'text' | 'highlight' | 'freehand';

interface Annotation {
  id: string;
  type: AnnotationTool;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  text?: string;
  points?: { x: number; y: number }[];
}

export const DrawingStudio: React.FC<DrawingStudioProps> = ({
  drawings,
  onOpenTrace,
  onBack,
  onUploadDrawing,
}) => {
  const [selectedDrawing, setSelectedDrawing] = useState<DrawingItem | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeTool, setActiveTool] = useState<AnnotationTool>('none');
  const [selectedColor, setSelectedColor] = useState('#ef4444');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const colors = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#8b5cf6', '#f97316', '#ec4899', '#ffffff'];

  // Draw annotations on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    annotations.forEach((ann) => {
      ctx.strokeStyle = ann.color;
      ctx.fillStyle = ann.color + '33';
      ctx.lineWidth = 3;
      ctx.font = '20px Inter, sans-serif';

      if (ann.type === 'circle' && ann.width && ann.height) {
        ctx.beginPath();
        ctx.ellipse(ann.x + ann.width / 2, ann.y + ann.height / 2, Math.abs(ann.width / 2), Math.abs(ann.height / 2), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();
      } else if (ann.type === 'rectangle' && ann.width && ann.height) {
        ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
        ctx.fillRect(ann.x, ann.y, ann.width, ann.height);
      } else if (ann.type === 'freehand' && ann.points && ann.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(ann.points[0].x, ann.points[0].y);
        for (let i = 1; i < ann.points.length; i++) {
          ctx.lineTo(ann.points[i].x, ann.points[i].y);
        }
        ctx.stroke();
      } else if (ann.type === 'text' && ann.text) {
        ctx.fillStyle = ann.color;
        ctx.font = '20px Inter, sans-serif';
        ctx.fillText(ann.text, ann.x, ann.y);
      } else if (ann.type === 'highlight' && ann.width && ann.height) {
        ctx.fillStyle = ann.color + '55';
        ctx.fillRect(ann.x, ann.y, ann.width, ann.height);
      }
    });
  }, [annotations]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'none') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    setIsDrawing(true);
    setStartPos({ x, y });

    if (activeTool === 'freehand') {
      const newAnn: Annotation = {
        id: `ann-${Date.now()}`,
        type: 'freehand',
        x: 0,
        y: 0,
        color: selectedColor,
        points: [{ x, y }],
      };
      setAnnotations([...annotations, newAnn]);
    } else if (activeTool === 'text') {
      const text = prompt('Enter text for annotation:');
      if (text) {
        const newAnn: Annotation = {
          id: `ann-${Date.now()}`,
          type: 'text',
          x,
          y,
          color: selectedColor,
          text: text,
        };
        setAnnotations([...annotations, newAnn]);
      }
    } else {
      // For circle, rectangle, highlight
      const newAnn: Annotation = {
        id: `ann-${Date.now()}`,
        type: activeTool,
        x,
        y,
        width: 0,
        height: 0,
        color: selectedColor,
      };
      setAnnotations([...annotations, newAnn]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool === 'none' || activeTool === 'text' || activeTool === 'freehand') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    const lastAnn = annotations[annotations.length - 1];
    if (lastAnn && lastAnn.type !== 'freehand' && lastAnn.type !== 'text') {
      const updated = [...annotations];
      updated[updated.length - 1] = {
        ...lastAnn,
        width: x - startPos.x,
        height: y - startPos.y,
      };
      setAnnotations(updated);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const clearAnnotations = () => {
    if (window.confirm('Clear all annotations?')) {
      setAnnotations([]);
    }
  };

  const handleSaveAnnotations = () => {
    console.log('Saving annotations:', annotations);
    alert(`âœ… Saved ${annotations.length} annotations!`);
  };

  const getToolButtonClass = (tool: AnnotationTool) => {
    return `p-2 rounded-lg transition flex items-center gap-1.5 text-xs ${activeTool === tool
      ? 'bg-emerald-600 text-white'
      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
      }`;
  };

  const getFileType = (url: string): string => {
    if (!url) return 'unknown';
    // Check if it's a blob URL
    if (url.startsWith('blob:')) return 'blob';
    const extension = url.split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(extension)) return 'pdf';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(extension)) return 'image';
    if (['dwg', 'dxf'].includes(extension)) return 'cad';
    return 'unknown';
  };

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.25, 3));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.25, 0.5));

  // Reset zoom when drawing changes
  useEffect(() => {
    setZoom(1);
  }, [selectedDrawing]);

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-semibold text-slate-600 dark:text-slate-400"
      >
        <ArrowLeft size={16} />
        Back to Project Hub
      </button>

      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Layers className="w-4 h-4" />
            <span>Drawing Studio</span>
          </div>
          <h2 className="text-xl font-bold">PDF CAD Drawings</h2>
          <p className="text-xs text-slate-400">{drawings.length} drawings</p>
        </div>
        <button
          onClick={onUploadDrawing}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
        >
          <Upload className="w-4 h-4" />
          Upload Drawing
        </button>
      </div>

      {!drawings || drawings.length === 0 ? (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <FileImage size={48} className="mx-auto text-slate-400 dark:text-slate-600 mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No drawings uploaded for this project yet.</p>
          <button
            onClick={onUploadDrawing}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition"
          >
            + Upload Drawing
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {drawings.map((drawing) => (
            <div
              key={drawing.id}
              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-emerald-500 transition"
            >
              <div className="flex items-center gap-2">
                <FileImage size={16} className="text-emerald-500" />
                <span className="text-sm font-medium">{drawing.drawingNumber || drawing.title}</span>
                <span className="text-xs text-slate-500">{drawing.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${drawing.status === 'Approved for Construction'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : drawing.status === 'Draft'
                    ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                  {drawing.status}
                </span>
                <button
                  onClick={() => setSelectedDrawing(drawing)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                  title="View Drawing"
                >
                  <Eye size={16} className="text-blue-500" />
                </button>
                <button
                  onClick={() => {
                    // Convert string[] to SingleSourceLink[]
                    const links: SingleSourceLink[] = (drawing.linkedAssets || []).map(id => ({
                      id,
                      type: 'drawing',
                      title: drawing.title || 'Unknown',
                      date: drawing.date || '',
                      status: drawing.status || '',
                    }));
                    onOpenTrace(
                      { id: drawing.id, type: 'drawing', title: drawing.drawingNumber || drawing.title, subtitle: drawing.title },
                      links
                    );
                  }}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                  title="Trace connected assets"
                >
                  <Link2 size={14} className="text-emerald-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawing Viewer Modal */}
      {selectedDrawing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 w-full max-w-6xl max-h-[95vh] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {selectedDrawing.drawingNumber || selectedDrawing.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedDrawing.title}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button onClick={() => setActiveTool('none')} className={getToolButtonClass('none')}>
                    âœ‹ Select
                  </button>
                  <button onClick={() => setActiveTool('circle')} className={getToolButtonClass('circle')}>
                    <Circle size={14} /> Circle
                  </button>
                  <button onClick={() => setActiveTool('rectangle')} className={getToolButtonClass('rectangle')}>
                    <Square size={14} /> Box
                  </button>
                  <button onClick={() => setActiveTool('text')} className={getToolButtonClass('text')}>
                    <Type size={14} /> Text
                  </button>
                  <button onClick={() => setActiveTool('freehand')} className={getToolButtonClass('freehand')}>
                    âœï¸ Draw
                  </button>
                  <button onClick={() => setActiveTool('highlight')} className={getToolButtonClass('highlight')}>
                    <Highlighter size={14} /> Highlight
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-5 h-5 rounded-full border-2 ${selectedColor === color ? 'border-white shadow-lg' : 'border-transparent'
                        }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={handleZoomOut} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200">
                    <ZoomOut size={14} />
                  </button>
                  <span className="text-xs font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
                  <button onClick={handleZoomIn} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200">
                    <ZoomIn size={14} />
                  </button>
                </div>
                <button
                  onClick={clearAnnotations}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                  title="Clear all annotations"
                >
                  <Eraser size={16} />
                </button>
                <button
                  onClick={handleSaveAnnotations}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                  title="Save annotations"
                >
                  <Save size={16} />
                </button>
                <button
                  onClick={() => setSelectedDrawing(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Viewer */}
            <div className="flex-1 overflow-auto p-4 relative min-h-[500px]" ref={overlayRef}>
              <div className="relative inline-block">
                {selectedDrawing.fileUrl ? (
                  getFileType(selectedDrawing.fileUrl) === 'image' || getFileType(selectedDrawing.fileUrl) === 'blob' ? (
                    <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                      <img
                        ref={imageRef}
                        src={selectedDrawing.fileUrl}
                        alt={selectedDrawing.title}
                        className="max-w-full max-h-[600px] object-contain rounded-lg"
                        onError={(e) => {
                          console.error('Image load error:', e);
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="%23f3f4f6" width="400" height="300"/><text x="200" y="150" font-family="Arial" font-size="20" fill="%239ca3af" text-anchor="middle">Image Preview Not Available</text></svg>';
                        }}
                      />
                      <canvas
                        ref={canvasRef}
                        width={800}
                        height={600}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                        style={{ pointerEvents: activeTool !== 'none' ? 'auto' : 'none' }}
                      />
                    </div>
                  ) : getFileType(selectedDrawing.fileUrl) === 'pdf' ? (
                    <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                      <iframe
                        src={`${selectedDrawing.fileUrl}#toolbar=0`}
                        className="w-full h-[600px] rounded-lg"
                        title={selectedDrawing.title}
                      />
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 dark:text-slate-400 p-12">
                      <FileImage size={64} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-semibold">Preview Not Available</p>
                      <p className="text-sm">File type: {selectedDrawing.fileUrl?.split('.').pop() || 'blob'}</p>
                      <a
                        href={selectedDrawing.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm transition"
                      >
                        Download File
                      </a>
                    </div>
                  )
                ) : (
                  <div className="text-center text-slate-500 dark:text-slate-400 p-12">
                    <FileImage size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold">No File Available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div>
                <span>Status: {selectedDrawing.status}</span>
                <span className="mx-2">|</span>
                <span>Revision: {selectedDrawing.revision}</span>
                <span className="mx-2">|</span>
                <span>Date: {selectedDrawing.date}</span>
                <span className="mx-2">|</span>
                <span>Annotations: {annotations.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500">ðŸ’¡ {activeTool === 'none' ? 'Select a tool to annotate' : `Drawing with ${activeTool}`}</span>
                <button
                  onClick={() => setSelectedDrawing(null)}
                  className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

