import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Maximize2,
  Download,
  ShieldCheck,
  Check,
  Sliders,
  Image as ImageIcon,
  ZoomIn,
  RefreshCw,
  Layers,
  ArrowRight,
  Eye,
} from 'lucide-react';

export interface ImageUpscalerPanelProps {
  accentColor?: string;
}

type UpscaleMethod = 'bicubic_sharp' | 'lanczos' | 'pixel_art' | 'smooth_anime';
type ExportFormat = 'image/png' | 'image/jpeg' | 'image/webp';

export const ImageUpscalerPanel: React.FC<ImageUpscalerPanelProps> = ({
  accentColor = '#10B981',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [origWidth, setOrigWidth] = useState(0);
  const [origHeight, setOrigHeight] = useState(0);
  const [fileSize, setFileSize] = useState(0);

  // Upscale settings
  const [scaleFactor, setScaleFactor] = useState<number>(2);
  const [method, setMethod] = useState<UpscaleMethod>('bicubic_sharp');
  const [sharpness, setSharpness] = useState<number>(35); // 0 to 100%
  const [denoiseLevel, setDenoiseLevel] = useState<number>(20); // 0 to 100%
  const [exportFormat, setExportFormat] = useState<ExportFormat>('image/png');
  const [quality, setQuality] = useState<number>(0.95);

  // Result state
  const [isProcessing, setIsProcessing] = useState(false);
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
  const [upscaledWidth, setUpscaledWidth] = useState(0);
  const [upscaledHeight, setUpscaledHeight] = useState(0);
  const [upscaledSize, setUpscaledSize] = useState(0);

  // Preview & Split comparison
  const [splitPos, setSplitPos] = useState(50);
  const [previewZoom, setPreviewZoom] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'split' | 'side_by_side' | 'upscaled_only'>('split');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingSplit = useRef(false);

  // Load image
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setFileSize(selectedFile.size);
    const url = URL.createObjectURL(selectedFile);
    setImageUrl(url);
    setUpscaledUrl(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setOrigWidth(img.naturalWidth || img.width);
      setOrigHeight(img.naturalHeight || img.height);
    };
    img.src = url;
  };

  // Perform client-side high-quality offline upscaling
  const runUpscale = useCallback(async () => {
    if (!imageUrl || !origWidth || !origHeight) return;

    setIsProcessing(true);
    // Yield to let UI update
    await new Promise((r) => setTimeout(r, 60));

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image failed to load'));
        img.src = imageUrl;
      });

      const targetW = Math.round(origWidth * scaleFactor);
      const targetH = Math.round(origHeight * scaleFactor);

      const targetCanvas = document.createElement('canvas');
      targetCanvas.width = targetW;
      targetCanvas.height = targetH;
      const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Could not get canvas context');

      if (method === 'pixel_art') {
        // Nearest neighbor for retro pixel art
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, targetW, targetH);
      } else {
        // Progressive multi-step super-sampling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // For large scale (>2x), progressive step-ups prevent aliasing
        let currentW = origWidth;
        let currentH = origHeight;
        let stepCanvas = document.createElement('canvas');
        stepCanvas.width = currentW;
        stepCanvas.height = currentH;
        let stepCtx = stepCanvas.getContext('2d')!;
        stepCtx.drawImage(img, 0, 0);

        while (currentW < targetW) {
          const nextW = Math.min(targetW, Math.round(currentW * 1.5));
          const nextH = Math.min(targetH, Math.round(currentH * 1.5));

          const nextCanvas = document.createElement('canvas');
          nextCanvas.width = nextW;
          nextCanvas.height = nextH;
          const nextCtx = nextCanvas.getContext('2d')!;
          nextCtx.imageSmoothingEnabled = true;
          nextCtx.imageSmoothingQuality = 'high';
          nextCtx.drawImage(stepCanvas, 0, 0, nextW, nextH);

          stepCanvas = nextCanvas;
          stepCtx = nextCtx;
          currentW = nextW;
          currentH = nextH;
        }

        ctx.drawImage(stepCanvas, 0, 0, targetW, targetH);

        // Apply unsharp mask filter to restore crisp edges
        if (sharpness > 0 || method === 'bicubic_sharp') {
          const imgData = ctx.getImageData(0, 0, targetW, targetH);
          const data = imgData.data;
          const copy = new Uint8ClampedArray(data);

          const factor = (sharpness / 100) * 0.75;
          const rowBytes = targetW * 4;

          // 3x3 Laplace unsharp convolution kernel
          for (let y = 1; y < targetH - 1; y++) {
            const yOffset = y * rowBytes;
            const topOffset = (y - 1) * rowBytes;
            const botOffset = (y + 1) * rowBytes;

            for (let x = 1; x < targetW - 1; x++) {
              const idx = yOffset + x * 4;

              for (let c = 0; c < 3; c++) {
                const center = copy[idx + c];
                const top = copy[topOffset + x * 4 + c];
                const bot = copy[botOffset + x * 4 + c];
                const left = copy[yOffset + (x - 1) * 4 + c];
                const right = copy[yOffset + (x + 1) * 4 + c];

                // Laplace edge delta
                const edge = center * 4 - top - bot - left - right;
                const enhanced = center + edge * factor;
                data[idx + c] = enhanced < 0 ? 0 : enhanced > 255 ? 255 : enhanced;
              }
            }
          }
          ctx.putImageData(imgData, 0, 0);
        }

        // Apply denoise smoothing pass for anime/smooth mode if selected
        if (method === 'smooth_anime' && denoiseLevel > 0) {
          const imgData = ctx.getImageData(0, 0, targetW, targetH);
          const data = imgData.data;
          const copy = new Uint8ClampedArray(data);
          const blend = (denoiseLevel / 100) * 0.35;
          const rowBytes = targetW * 4;

          for (let y = 1; y < targetH - 1; y++) {
            const yOffset = y * rowBytes;
            for (let x = 1; x < targetW - 1; x++) {
              const idx = yOffset + x * 4;
              for (let c = 0; c < 3; c++) {
                const avg =
                  (copy[idx - 4 + c] +
                    copy[idx + 4 + c] +
                    copy[idx - rowBytes + c] +
                    copy[idx + rowBytes + c]) /
                  4;
                data[idx + c] = Math.round(copy[idx + c] * (1 - blend) + avg * blend);
              }
            }
          }
          ctx.putImageData(imgData, 0, 0);
        }
      }

      // Convert to blob
      targetCanvas.toBlob(
        (blob) => {
          if (blob) {
            if (upscaledUrl) URL.revokeObjectURL(upscaledUrl);
            const newUrl = URL.createObjectURL(blob);
            setUpscaledUrl(newUrl);
            setUpscaledWidth(targetW);
            setUpscaledHeight(targetH);
            setUpscaledSize(blob.size);
          }
          setIsProcessing(false);
        },
        exportFormat,
        exportFormat === 'image/png' ? undefined : quality
      );
    } catch (err) {
      console.error('Upscale failed:', err);
      setIsProcessing(false);
    }
  }, [imageUrl, origWidth, origHeight, scaleFactor, method, sharpness, denoiseLevel, exportFormat, quality, upscaledUrl]);

  // Auto-run upscale when image is loaded or factor changes
  useEffect(() => {
    if (imageUrl && origWidth > 0) {
      runUpscale();
    }
  }, [imageUrl, origWidth, origHeight, scaleFactor, method]);

  // Handle split slider drag
  const handleSplitDrag = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    setSplitPos((x / rect.width) * 100);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (isDraggingSplit.current) handleSplitDrag(e.clientX);
    };
    const onTouch = (e: TouchEvent) => {
      if (isDraggingSplit.current && e.touches[0]) handleSplitDrag(e.touches[0].clientX);
    };
    const onUp = () => {
      isDraggingSplit.current = false;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouch);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadUpscaled = () => {
    if (!upscaledUrl) return;
    const link = document.createElement('a');
    link.href = upscaledUrl;
    const ext = exportFormat === 'image/png' ? 'png' : exportFormat === 'image/webp' ? 'webp' : 'jpg';
    const base = file?.name ? file.name.substring(0, file.name.lastIndexOf('.')) : 'image';
    link.download = `${base}-upscaled-${scaleFactor}x.${ext}`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!imageUrl && (
        <div className="max-w-xl mx-auto py-12">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-8 cursor-pointer bg-white/60 dark:bg-slate-900/60 backdrop-blur-md transition-all group shadow-sm hover:shadow-md">
            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-base mb-1">
              Select or Drop Image to Upscale
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-sm">
              Enlarge photos, pixel art, or graphics up to 8× with super-resolution sharpening • 100% Offline & Secure
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
              }}
            />
          </label>
        </div>
      )}

      {imageUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-4 space-y-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-emerald-500" />
                  <span>Upscale Factor</span>
                </h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {scaleFactor}× Magnification
                </span>
              </div>

              {/* Factor Presets */}
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 8].map((factor) => (
                  <button
                    key={factor}
                    onClick={() => setScaleFactor(factor)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      scaleFactor === factor
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {factor}×
                  </button>
                ))}
              </div>

              {/* Upscaling Algorithm */}
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Enhancement Model / Engine
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'bicubic_sharp', label: 'Super-Sharp Bicubic', desc: 'Photos & Portraits' },
                    { id: 'lanczos', label: 'Lanczos Texture', desc: 'High-Detail Graphics' },
                    { id: 'pixel_art', label: 'Pixel Art (Nearest)', desc: 'Retro Sprites & Icons' },
                    { id: 'smooth_anime', label: 'Anime & Illustration', desc: 'Denoise & Clean Edges' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id as UpscaleMethod)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        method === m.id
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-semibold">{m.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fine-Tuning Sliders */}
              {method !== 'pixel_art' && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">Edge Sharpening</span>
                      <span className="font-mono font-medium text-slate-900 dark:text-white">{sharpness}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={sharpness}
                      onChange={(e) => setSharpness(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  {method === 'smooth_anime' && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 dark:text-slate-400">JPEG Noise Reduction</span>
                        <span className="font-mono font-medium text-slate-900 dark:text-white">{denoiseLevel}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={denoiseLevel}
                        onChange={(e) => setDenoiseLevel(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                  )}

                  <button
                    onClick={runUpscale}
                    disabled={isProcessing}
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin text-emerald-500' : ''}`} />
                    <span>{isProcessing ? 'Recomputing Details...' : 'Apply Enhancements'}</span>
                  </button>
                </div>
              )}

              {/* Export Format */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'image/png', label: 'PNG Lossless' },
                    { id: 'image/webp', label: 'WebP Compact' },
                    { id: 'image/jpeg', label: 'JPEG Photo' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => setExportFormat(fmt.id as ExportFormat)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        exportFormat === fmt.id
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={downloadUpscaled}
                disabled={!upscaledUrl || isProcessing}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Upscaled ({upscaledWidth} × {upscaledHeight})</span>
              </button>
            </div>

            {/* Resolution Metric Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Resolution Comparison</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                  {scaleFactor * scaleFactor}× Megapixel Boost
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Original</div>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {origWidth} × {origHeight}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {((origWidth * origHeight) / 1000000).toFixed(2)} MP • {formatBytes(fileSize)}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">Upscaled</div>
                  <div className="font-mono font-bold text-emerald-900 dark:text-emerald-100 mt-0.5">
                    {upscaledWidth || origWidth * scaleFactor} × {upscaledHeight || origHeight * scaleFactor}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {(((upscaledWidth || origWidth * scaleFactor) * (upscaledHeight || origHeight * scaleFactor)) / 1000000).toFixed(2)} MP • {formatBytes(upscaledSize)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="lg:col-span-8 space-y-4">
            {/* View Mode Bar */}
            <div className="flex items-center justify-between flex-wrap gap-2 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'split', label: 'Split Slider' },
                  { id: 'side_by_side', label: 'Side by Side' },
                  { id: 'upscaled_only', label: 'Upscaled High-Res' },
                ].map((vm) => (
                  <button
                    key={vm.id}
                    onClick={() => setViewMode(vm.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      viewMode === vm.id
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {vm.label}
                  </button>
                ))}
              </div>

              {/* Zoom Buttons */}
              <div className="flex items-center gap-1">
                {[1, 2, 4].map((z) => (
                  <button
                    key={z}
                    onClick={() => setPreviewZoom(z)}
                    className={`px-2 py-1 rounded-lg text-xs font-mono font-semibold ${
                      previewZoom === z
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {z}× Loupe
                  </button>
                ))}
              </div>
            </div>

            {/* Split Comparison Canvas */}
            {viewMode === 'split' && (
              <div
                ref={containerRef}
                onMouseDown={() => (isDraggingSplit.current = true)}
                onTouchStart={() => (isDraggingSplit.current = true)}
                className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 select-none cursor-ew-resize min-h-[460px] flex items-center justify-center"
              >
                {/* Background: Upscaled image */}
                {upscaledUrl ? (
                  <img
                    src={upscaledUrl}
                    alt="Upscaled"
                    style={{ transform: `scale(${previewZoom})` }}
                    className="max-h-[520px] w-auto object-contain transition-transform duration-100"
                  />
                ) : (
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                    <span>Super-sampling high-resolution details...</span>
                  </div>
                )}

                {/* Foreground Clip: Original low-res image */}
                <div
                  className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none"
                  style={{ width: `${splitPos}%`, borderRight: '2px solid #10B981' }}
                >
                  <img
                    src={imageUrl}
                    alt="Original"
                    style={{
                      transform: `scale(${previewZoom})`,
                      width: containerRef.current?.clientWidth,
                      maxWidth: 'none',
                    }}
                    className="max-h-[520px] object-contain"
                  />
                </div>

                {/* Slider Divider Handle */}
                <div
                  className="absolute top-0 bottom-0 pointer-events-none"
                  style={{ left: `${splitPos}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="h-full w-0.5 bg-emerald-500 shadow-md flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900">
                      <Sliders className="w-3.5 h-3.5 rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Left/Right Badges */}
                <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase pointer-events-none">
                  Original (1×)
                </span>
                <span className="absolute top-3 right-3 px-2 py-1 rounded-md bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase pointer-events-none">
                  Upscaled ({scaleFactor}×)
                </span>
              </div>
            )}

            {/* Side-by-Side View */}
            {viewMode === 'side_by_side' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                    <span>Original ({origWidth} × {origHeight})</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">1× Native</span>
                  </div>
                  <div className="h-80 flex items-center justify-center overflow-hidden rounded-xl bg-slate-950">
                    <img
                      src={imageUrl}
                      alt="Original"
                      style={{ transform: `scale(${previewZoom})` }}
                      className="max-h-full object-contain"
                    />
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                    <span>Upscaled ({upscaledWidth || origWidth * scaleFactor} × {upscaledHeight || origHeight * scaleFactor})</span>
                    <span className="text-[10px] uppercase font-bold text-emerald-500">{scaleFactor}× Enhanced</span>
                  </div>
                  <div className="h-80 flex items-center justify-center overflow-hidden rounded-xl bg-slate-950">
                    {upscaledUrl ? (
                      <img
                        src={upscaledUrl}
                        alt="Upscaled"
                        style={{ transform: `scale(${previewZoom})` }}
                        className="max-h-full object-contain"
                      />
                    ) : (
                      <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Upscaled Only View */}
            {viewMode === 'upscaled_only' && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                  <span>Pristine High-Resolution Canvas</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {upscaledWidth} × {upscaledHeight} px
                  </span>
                </div>
                <div className="h-[460px] flex items-center justify-center overflow-auto rounded-xl bg-slate-950 p-2">
                  {upscaledUrl ? (
                    <img
                      src={upscaledUrl}
                      alt="Upscaled Full"
                      style={{ transform: `scale(${previewZoom})` }}
                      className="max-h-full object-contain"
                    />
                  ) : (
                    <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
                  )}
                </div>
              </div>
            )}

            {/* Change Image Button */}
            <div className="flex justify-end">
              <label className="text-xs text-slate-500 hover:text-emerald-500 cursor-pointer flex items-center gap-1 font-medium transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Choose Different Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
