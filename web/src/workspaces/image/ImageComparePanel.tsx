import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Columns,
  Layers,
  Sparkles,
  Download,
  ShieldCheck,
  Check,
  Sliders,
  Image as ImageIcon,
  ArrowRight,
  Plus,
  RefreshCw,
  Eye,
} from 'lucide-react';

export interface ImageComparePanelProps {
  accentColor?: string;
}

interface LoadedCompareImage {
  name: string;
  file: File;
  url: string;
  width: number;
  height: number;
  size: number;
}

export const ImageComparePanel: React.FC<ImageComparePanelProps> = () => {
  const [imageA, setImageA] = useState<LoadedCompareImage | null>(null);
  const [imageB, setImageB] = useState<LoadedCompareImage | null>(null);

  // Compare mode: 'split' (horizontal divider), 'side_by_side', 'diff_heatmap'
  const [compareMode, setCompareMode] = useState<'split' | 'side_by_side' | 'heatmap'>('split');
  const [sliderPos, setSliderPos] = useState<number>(50); // 0 to 100%

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgAElementRef = useRef<HTMLImageElement | null>(null);
  const imgBElementRef = useRef<HTMLImageElement | null>(null);

  const handleUploadA = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImageA({
        name: file.name,
        file,
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
      size: file.size,
    });
    };
    img.src = url;
    e.target.value = '';
  };

  const handleUploadB = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImageB({
        name: file.name,
        file,
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
      });
    };
    img.src = url;
    e.target.value = '';
  };

  // Render comparison canvas
  const renderCanvas = useCallback(() => {
    if (!canvasRef.current || !imgAElementRef.current || !imgBElementRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgA = imgAElementRef.current;
    const imgB = imgBElementRef.current;

    const maxW = Math.max(imgA.naturalWidth, imgB.naturalWidth);
    const maxH = Math.max(imgA.naturalHeight, imgB.naturalHeight);

    canvas.width = maxW;
    canvas.height = maxH;
    ctx.clearRect(0, 0, maxW, maxH);

    if (compareMode === 'split') {
      // Draw Image A (Original)
      ctx.drawImage(imgA, 0, 0, maxW, maxH);

      // Draw Image B (Modified) on right of slider
      const splitX = (maxW * sliderPos) / 100;
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, maxW - splitX, maxH);
      ctx.clip();
      ctx.drawImage(imgB, 0, 0, maxW, maxH);
      ctx.restore();

      // Divider line
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = Math.max(3, maxW / 350);
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, maxH);
      ctx.stroke();
    } else if (compareMode === 'heatmap') {
      // Compute pixel difference heatmap
      const offA = document.createElement('canvas');
      offA.width = maxW;
      offA.height = maxH;
      const ctxA = offA.getContext('2d')!;
      ctxA.drawImage(imgA, 0, 0, maxW, maxH);
      const dataA = ctxA.getImageData(0, 0, maxW, maxH).data;

      const offB = document.createElement('canvas');
      offB.width = maxW;
      offB.height = maxH;
      const ctxB = offB.getContext('2d')!;
      ctxB.drawImage(imgB, 0, 0, maxW, maxH);
      const dataB = ctxB.getImageData(0, 0, maxW, maxH).data;

      const diffImg = ctx.createImageData(maxW, maxH);
      const diffData = diffImg.data;

      for (let i = 0; i < dataA.length; i += 4) {
        const dr = Math.abs(dataA[i] - dataB[i]);
        const dg = Math.abs(dataA[i + 1] - dataB[i + 1]);
        const db = Math.abs(dataA[i + 2] - dataB[i + 2]);
        const diff = dr + dg + db;

        if (diff > 12) {
          // Highlight modified pixel in bright neon magenta/red
          diffData[i] = 239; // R
          diffData[i + 1] = 68; // G
          diffData[i + 2] = 68; // B
          diffData[i + 3] = 255;
        } else {
          // Grayscale base image for non-changed areas
          const gray = (dataA[i] * 0.299 + dataA[i + 1] * 0.587 + dataA[i + 2] * 0.114) * 0.35;
          diffData[i] = gray;
          diffData[i + 1] = gray;
          diffData[i + 2] = gray;
          diffData[i + 3] = 255;
        }
      }
      ctx.putImageData(diffImg, 0, 0);
    }
  }, [compareMode, sliderPos]);

  useEffect(() => {
    if (imageA && imageB) {
      renderCanvas();
    }
  }, [imageA, imageB, renderCanvas]);

  return (
    <div className="space-y-6">
      {/* Upload Dropzones if not both selected */}
      {(!imageA || !imageB) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Box 1: Image A */}
          <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-10 text-center bg-white dark:bg-slate-900/60 shadow-xs hover:border-emerald-500 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadA}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <ImageIcon className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              {imageA ? `✓ Image A: ${imageA.name}` : 'Upload Original Photo (Image A)'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              {imageA ? `${imageA.width}×${imageA.height} px • ${(imageA.size / 1024).toFixed(1)} KB` : 'Before compression, edit, or filter'}
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-medium text-xs">
              <Plus className="w-3.5 h-3.5" />
              <span>{imageA ? 'Change Image A' : 'Select Image A'}</span>
            </div>
          </div>

          {/* Box 2: Image B */}
          <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-10 text-center bg-white dark:bg-slate-900/60 shadow-xs hover:border-emerald-500 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadB}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-3">
              <ImageIcon className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              {imageB ? `✓ Image B: ${imageB.name}` : 'Upload Modified Photo (Image B)'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              {imageB ? `${imageB.width}×${imageB.height} px • ${(imageB.size / 1024).toFixed(1)} KB` : 'After compression, edit, or filter'}
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 text-white font-medium text-xs">
              <Plus className="w-3.5 h-3.5" />
              <span>{imageB ? 'Change Image B' : 'Select Image B'}</span>
            </div>
          </div>
        </div>
      )}

      {/* When both images are loaded */}
      {imageA && imageB && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Hidden reference elements */}
          <img
            ref={imgAElementRef}
            src={imageA.url}
            alt="Img A"
            className="hidden"
            crossOrigin="anonymous"
            onLoad={renderCanvas}
          />
          <img
            ref={imgBElementRef}
            src={imageB.url}
            alt="Img B"
            className="hidden"
            crossOrigin="anonymous"
            onLoad={renderCanvas}
          />

          {/* Main Comparison Stage (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Top Mode Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCompareMode('split')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    compareMode === 'split'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Split Slider</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCompareMode('side_by_side')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    compareMode === 'side_by_side'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Side-by-Side</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCompareMode('heatmap')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    compareMode === 'heatmap'
                      ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Diff Heatmap</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setImageA(null);
                  setImageB(null);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition"
              >
                Reset Images
              </button>
            </div>

            {/* Display Canvas or Side-by-Side */}
            {compareMode !== 'side_by_side' ? (
              <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 flex items-center justify-center min-h-[440px] overflow-hidden select-none">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg block select-none"
                />

                {compareMode === 'split' && (
                  <>
                    <span className="absolute top-6 left-6 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur border border-slate-700 text-[11px] font-bold text-slate-300 pointer-events-none">
                      Image A: {imageA.name}
                    </span>
                    <span className="absolute top-6 right-6 px-2.5 py-1 rounded-md bg-emerald-950/80 backdrop-blur border border-emerald-700 text-[11px] font-bold text-emerald-300 pointer-events-none">
                      Image B: {imageB.name}
                    </span>
                  </>
                )}

                {compareMode === 'heatmap' && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur border border-slate-700 text-xs text-slate-200 flex items-center gap-2 pointer-events-none">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Red highlights indicate pixel changes</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 min-h-[440px]">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <span className="text-xs font-bold text-slate-300 truncate max-w-[200px]">
                    Image A: {imageA.name}
                  </span>
                  <img
                    src={imageA.url}
                    alt="A"
                    className="max-h-[420px] object-contain rounded shadow"
                  />
                </div>
                <div className="flex flex-col items-center justify-center space-y-2 border-l border-slate-800 pl-3">
                  <span className="text-xs font-bold text-emerald-400 truncate max-w-[200px]">
                    Image B: {imageB.name}
                  </span>
                  <img
                    src={imageB.url}
                    alt="B"
                    className="max-h-[420px] object-contain rounded shadow"
                  />
                </div>
              </div>
            )}

            {/* Split Slider Controller */}
            {compareMode === 'split' && (
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Slider Position ({sliderPos}%)</span>
                  <span className="text-slate-400 text-[11px]">
                    Drag to reveal Image A vs Image B
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Metrics Comparison Inspector Sidebar (Cols 8-12) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Columns className="w-4 h-4 text-emerald-500" />
                <span>Side-by-Side File Metrics</span>
              </h3>

              <div className="space-y-3">
                {/* Metric 1: File Size Difference */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-xs text-slate-500 font-medium">File Size Comparison</span>
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-800 dark:text-slate-200">
                      A: {(imageA.size / 1024).toFixed(1)} KB
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-emerald-600 font-bold">
                      B: {(imageB.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  {imageA.size !== imageB.size && (
                    <p className="text-[11px] text-slate-500 pt-1">
                      {imageA.size > imageB.size
                        ? `Saved ${(((imageA.size - imageB.size) / imageA.size) * 100).toFixed(1)}% disk space in Image B`
                        : `Image B is ${(((imageB.size - imageA.size) / imageA.size) * 100).toFixed(1)}% larger`}
                    </p>
                  )}
                </div>

                {/* Metric 2: Resolution Dimensions */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Pixel Dimensions</span>
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-800 dark:text-slate-200">
                      {imageA.width} × {imageA.height} px
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-emerald-600 font-bold">
                      {imageB.width} × {imageB.height} px
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1">
                    {imageA.width === imageB.width && imageA.height === imageB.height
                      ? '✓ Exact matching dimensions'
                      : 'Dimensions differ between images'}
                  </p>
                </div>
              </div>
            </div>

            {/* Offline Guarantee */}
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>100% Offline Comparison. Files are diffed directly on local canvas.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
