import React, { useRef, useState, useEffect } from 'react';
import { Paintbrush, Eraser, RotateCcw, Check, X, Sliders } from 'lucide-react';

interface MaskEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  personUrl: string | null;
  onSaveMask: (maskFile: File) => void;
}

export const MaskEditorModal: React.FC<MaskEditorModalProps> = ({
  isOpen,
  onClose,
  personUrl,
  onSaveMask
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brushSize, setBrushSize] = useState<number>(35);
  const [isErasing, setIsErasing] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !personUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = personUrl;
    img.onload = () => {
      canvas.width = img.naturalWidth || 768;
      canvas.height = img.naturalHeight || 1024;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setImageLoaded(true);
    };
  }, [isOpen, personUrl]);

  if (!isOpen || !personUrl) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    ctx?.beginPath();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.lineWidth = brushSize * scaleX;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isErasing) {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(236, 72, 153, 0.7)';
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.7)';
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert drawn mask to grayscale binary mask (White on Black)
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const expCtx = exportCanvas.getContext('2d');
    if (!expCtx) return;

    // Fill black background
    expCtx.fillStyle = '#000000';
    expCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Draw painted strokes in solid white
    expCtx.globalCompositeOperation = 'source-over';
    expCtx.drawImage(canvas, 0, 0);
    const imgData = expCtx.getImageData(0, 0, exportCanvas.width, exportCanvas.height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 20) { // If stroke exists
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
      } else {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 255;
      }
    }
    expCtx.putImageData(imgData, 0, 0);

    exportCanvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'custom_brush_mask.png', { type: 'image/png' });
        onSaveMask(file);
        onClose();
      }
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
              <Paintbrush className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Selective Mask Brush Editor</h3>
              <p className="text-xs text-slate-400">Paint custom target zones (collar, sleeves, hemline, jacket)</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/90 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsErasing(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                !isErasing ? 'bg-pink-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Paintbrush className="w-3.5 h-3.5" />
              Brush (Add)
            </button>

            <button
              onClick={() => setIsErasing(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isErasing ? 'bg-brand-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              Eraser
            </button>

            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>

          {/* Brush Size */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" />
              Size: {brushSize}px
            </span>
            <input
              type="range"
              min={5}
              max={100}
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-32 accent-pink-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950">
          <div className="relative inline-block border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
            {/* Person Base Image */}
            <img
              src={personUrl}
              alt="Person Base"
              className="max-h-[500px] w-auto block select-none pointer-events-none"
            />
            {/* Drawing Canvas Overlay */}
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseMove={draw}
              onMouseLeave={stopDrawing}
              className="absolute inset-0 w-full h-full cursor-crosshair"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-brand-600 hover:from-pink-500 hover:to-brand-500 text-white text-xs font-bold shadow-lg"
          >
            <Check className="w-4 h-4" />
            Apply Selective Mask
          </button>
        </div>

      </div>
    </div>
  );
};
